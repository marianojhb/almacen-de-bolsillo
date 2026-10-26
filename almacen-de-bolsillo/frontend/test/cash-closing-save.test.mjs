import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

// Execute the real TypeScript modules with explicit doubles, without a native runtime or network.
async function loadModule(path, dependencies) {
  const url = new URL(path, import.meta.url);
  const source = await readFile(url, "utf8");
  const { outputText } = ts.transpileModule(source, {
    fileName: url.pathname,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  runInThisContext(`(function(require, exports) { ${outputText}\n})`, { filename: url.pathname })(
    (name) => {
      assert.ok(name in dependencies, `Dependencia no simulada: ${name}`);
      return dependencies[name];
    },
    exports,
  );
  return exports;
}

const summary = {
  from: new Date("2026-10-25T00:00:00.000Z"),
  to: new Date("2026-10-25T14:30:00.000Z"),
  opening: 100,
  cashSales: 50,
  cashExpenses: 20,
  expectedClosing: 130,
  mercadoPagoSales: 0,
  ualaSales: 0,
  getDifference: (actual) => actual - 130,
};

function findElement(node, type) {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === type) return node;
  const children = [node.props?.children].flat(Infinity);
  for (const child of children) {
    const result = findElement(child, type);
    if (result) return result;
  }
}

function findElementByLabel(node, accessibilityLabel) {
  if (!node || typeof node !== "object") return undefined;
  if (node.props?.accessibilityLabel === accessibilityLabel) return node;
  const children = [node.props?.children].flat(Infinity);
  for (const child of children) {
    const result = findElementByLabel(child, accessibilityLabel);
    if (result) return result;
  }
}

async function renderScreen(createBalanceRequest, user = { id: 7 }) {
  const states = [summary, "120,50", false, false, null, false, "cashIn", "", false, null];
  const updates = [];
  const navigation = [];
  let nextState = 0;
  const jsx = (type, props) => ({ type, props });
  const screen = await loadModule("../app/(tabs)/more/cash-closing/index.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    react: {
      useState: () => {
        const index = nextState++;
        return [states[index], (value) => { states[index] = value; updates.push({ index, value }); }];
      },
      useMemo: (calculate) => calculate(),
      useCallback: (callback) => callback,
      useEffect: () => {},
    },
    "react-native": Object.fromEntries(["ActivityIndicator", "KeyboardAvoidingView", "Modal", "Pressable", "RefreshControl", "ScrollView", "Text", "TextInput", "View"].map((name) => [name, name])),
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "expo-router": { router: { replace: (path) => navigation.push(path) } },
    "@/contexts/AuthContext": { useAuth: () => ({ user }) },
    "@/services/balancesApi": { createBalanceRequest },
    "@/services/salesApi": {},
    "@/services/transactionsApi": {},
    "@/utils/cash-closing": {},
  });
  const tree = screen.default();
  return { tree, states, updates, navigation };
}

test("el cierre envía el userId activo y navega al Dashboard tras guardarse", async () => {
  const requests = [];
  const screen = await renderScreen(async (input) => { requests.push(input); });
  findElement(screen.tree, "Pressable").props.onPress();
  await new Promise(setImmediate);
  assert.equal(requests.length, 1);
  assert.equal(requests[0].userId, 7);
  assert.equal(requests[0].actualClosing, 120.5);
  assert.equal("employeeId" in requests[0], false);
  assert.deepEqual(screen.navigation, ["/"]);
});

test("un rechazo conserva el importe, muestra el mensaje y permite reintentar sin navegar", async () => {
  const message = "No se puede identificar al empleado responsable.";
  const screen = await renderScreen(async () => { throw new Error(message); });
  findElement(screen.tree, "Pressable").props.onPress();
  await new Promise(setImmediate);
  assert.equal(screen.states[1], "120,50");
  assert.equal(screen.states[3], false);
  assert.equal(screen.states[4], message);
  assert.equal(screen.updates.some(({ index }) => index === 1), false);
  assert.deepEqual(screen.navigation, []);
});

test("sin cuenta activa no envía un cierre sin usuario y conserva el importe", async () => {
  let requests = 0;
  const screen = await renderScreen(async () => { requests++; }, null);
  findElement(screen.tree, "Pressable").props.onPress();
  await new Promise(setImmediate);
  assert.equal(requests, 0);
  assert.equal(screen.states[1], "120,50");
  assert.match(screen.states[4], /sesión/i);
  assert.deepEqual(screen.navigation, []);
});

test("el botón de aportes y retiros solo se muestra al BUSINESS_OWNER", async () => {
  const label = "Registrar aporte o retiro de efectivo";

  for (const role of ["BUSINESS_OWNER", "ADMIN", "SUPERVISOR", "EMPLOYEE"]) {
    const screen = await renderScreen(async () => {}, { id: 7, role });
    assert.equal(Boolean(findElementByLabel(screen.tree, label)), role === "BUSINESS_OWNER");
  }
});

test("la API normaliza employeeId como número o null en balances nuevos e históricos", async () => {
  for (const [employeeId, expected] of [["42", 42], [42, 42], [null, null], [undefined, null]]) {
    const api = await loadModule("../services/balancesApi.ts", {
      "@/services/apiClient": { apiRequest: async () => [{ employeeId, cashIn: "50", cashOut: "20", opening: "100", expectedClosing: "130", actualClosing: "120", difference: "-10" }] },
    });
    const [balance] = await api.getBalancesRequest();
    assert.equal(balance.employeeId, expected);
    assert.equal(balance.cashIn, 50);
  }
});

test("la API serializa userId en el POST y normaliza el balance creado", async () => {
  const requests = [];
  const api = await loadModule("../services/balancesApi.ts", {
    "@/services/apiClient": { apiRequest: async (path, options) => {
      requests.push({ path, options });
      return { employeeId: "42", actualClosing: "120.5" };
    } },
  });
  const result = await api.createBalanceRequest({ userId: 7, actualClosing: 120.5 });
  assert.equal(requests[0].path, "/balances");
  assert.equal(requests[0].options.method, "POST");
  assert.equal(JSON.parse(requests[0].options.body).userId, 7);
  assert.equal(result.employeeId, 42);
});
