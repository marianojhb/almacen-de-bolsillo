import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

async function loadModule(path, dependencies = {}) {
  const url = new URL(path, import.meta.url);
  const { outputText } = ts.transpileModule(await readFile(url, "utf8"), {
    fileName: url.pathname,
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  });
  const exports = {};
  runInThisContext(`(function(require, exports) { ${outputText}\n})`, { filename: url.pathname })(
    (name) => { assert.ok(name in dependencies, `Dependencia no simulada: ${name}`); return dependencies[name]; },
    exports,
  );
  return exports;
}

const jsx = (type, props) => ({ type, props });
const baseDependencies = {
  "react/jsx-runtime": { jsx, jsxs: jsx },
  "react-native": Object.fromEntries(["View", "Text", "FlatList", "ActivityIndicator", "Pressable"].map((name) => [name, name])),
  "@expo/vector-icons": { Ionicons: "Ionicons" },
};

function text(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  if (Array.isArray(node)) return node.map(text).join(" ");
  return text(node.props?.children);
}

test("Más ancla Caja en su stack, muestra el enlace y protege el historial solo para BUSINESS_OWNER", async () => {
  for (const role of ["BUSINESS_OWNER", "ADMIN", "SUPERVISOR", "EMPLOYEE", null]) {
    const navigation = [];
    const Stack = Object.assign(() => {}, { Screen: "Stack.Screen", Protected: "Stack.Protected" });
    const layout = await loadModule("../app/(tabs)/more/_layout.tsx", {
      ...baseDependencies,
      "expo-router": { Stack, router: { push: (path) => navigation.push(path) } },
      "@/components/ui/notebook": { useNotebookHeader: () => ({ headerTintColor: "#173F30" }) },
      "@/contexts/AuthContext": { useAuth: () => ({ user: role ? { role } : null }) },
      "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true, hasFullAccess: true }) },
    });
    assert.equal(layout.unstable_settings?.anchor, "index");
    const children = layout.default().props.children;
    const cashScreen = children.find((child) => child?.props?.name === "cash-closing/index");
    const historyProtection = children.find((child) => child?.props?.guard === (role === "BUSINESS_OWNER"));
    assert.equal(cashScreen.props.options.title, "Caja");
    assert.ok(historyProtection);
    const button = cashScreen.props.options.headerRight();
    if (role === "BUSINESS_OWNER") {
      assert.equal(button.props.accessibilityLabel, "Ver historial de cierres");
      button.props.onPress();
      assert.deepEqual(navigation, ["/more/cash-closing/history"]);
    } else {
      assert.equal(button, null);
    }
  }
});

async function historyHarness(role, request) {
  const states = [];
  let cursor = 0;
  let focus;
  const requestId = { current: 0 };
  const history = await loadModule("../app/(tabs)/more/cash-closing/history.tsx", {
    ...baseDependencies,
    "@almacen/shared": { formatFullName: (first, last) => [first, last].filter(Boolean).join(" ") },
    "@/contexts/AuthContext": { useAuth: () => ({ user: role ? { role } : null }) },
    "@/services/balancesApi": { getBalanceHistoryRequest: request },
    "expo-router": { Redirect: "Redirect", useFocusEffect: (callback) => { focus = callback; } },
    react: {
      useRef: () => requestId,
      useCallback: (callback) => callback,
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
      },
    },
  });
  const render = () => { cursor = 0; return history.default(); };
  render();
  return { render, states, focus: () => focus() };
}

test("el acceso directo de otros roles redirige a Caja y no consulta el historial", async () => {
  for (const role of ["ADMIN", "SUPERVISOR", "EMPLOYEE", null]) {
    let calls = 0;
    const screen = await historyHarness(role, async () => { calls++; return []; });
    screen.focus();
    assert.equal(screen.render().type, "Redirect");
    assert.equal(screen.render().props.href, "/more/cash-closing");
    assert.equal(calls, 0);
  }
});

const record = {
  id: 3,
  date: "2026-10-25T14:30:00.000Z",
  expectedClosing: 130,
  actualClosing: 120,
  difference: -10,
  employee: { firstname: "Ana", lastname: "Pérez", fullname: "Ana Pérez", user: { email: "ana@example.test" } },
};

test("el owner ve quién cerró la caja y los históricos sin responsable tienen un texto explícito", async () => {
  const screen = await historyHarness("BUSINESS_OWNER", async () => [record]);
  screen.focus();
  await new Promise(setImmediate);
  const list = screen.render();
  assert.deepEqual(list.props.data, [record]);
  assert.equal(list.props.refreshing, false);
  const element = list.props.renderItem({ item: record });
  const card = element.type(element.props);
  assert.match(text(card), /Cerrada por/);
  assert.match(text(card), /Ana Pérez/);
  assert.match(text(card), /ana@example.test/);
  const historical = list.props.renderItem({ item: { ...record, employee: null } });
  assert.match(text(historical.type(historical.props)), /Usuario no registrado/);
});

test("el historial contempla carga, vacío y error con reintento", async () => {
  const screen = await historyHarness("BUSINESS_OWNER", async () => []);
  assert.match(text(screen.render().props.ListEmptyComponent), /Cargando cierres/);
  screen.focus();
  await new Promise(setImmediate);
  assert.match(text(screen.render().props.ListEmptyComponent), /Todavía no hay cierres/);
  const failed = await historyHarness("BUSINESS_OWNER", async () => { throw new Error("Sin conexión"); });
  failed.focus();
  await new Promise(setImmediate);
  assert.match(text(failed.render().props.ListHeaderComponent), /Sin conexión/);
  assert.match(text(failed.render().props.ListHeaderComponent), /Reintentar/);
  assert.equal(failed.states[1], false);
  failed.render().props.onRefresh();
  assert.equal(failed.states[1], true);
  await new Promise(setImmediate);
  assert.equal(failed.states[1], false);
});

test("la API de historial conserva al responsable y normaliza importes e históricos", async () => {
  const api = await loadModule("../services/balancesApi.ts", {
    "@/services/apiClient": { apiRequest: async () => [
      { ...record, employeeId: "42", actualClosing: "120" },
      { ...record, employee: undefined, employeeId: null },
    ] },
  });
  const balances = await api.getBalanceHistoryRequest();
  assert.equal(balances[0].employee.user.email, "ana@example.test");
  assert.equal(balances[0].employeeId, 42);
  assert.equal(balances[0].actualClosing, 120);
  assert.equal(balances[1].employee, null);
});

test("Más conserva Caja pero no agrega una opción propia de historial", async () => {
  const { MORE_OPTIONS } = await loadModule("../constants/more-options.ts");
  assert.equal(MORE_OPTIONS.find((option) => option.id === "cash-closing").title, "Caja");
  assert.equal(MORE_OPTIONS.some((option) => option.href.includes("history")), false);
  const tabs = await readFile(new URL("../app/(tabs)/_layout.tsx", import.meta.url), "utf8");
  assert.doesNotMatch(tabs, /name="history"/);
});
