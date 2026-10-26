import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { runInThisContext } from "node:vm";
import ts from "typescript";

async function loadModule(path, dependencies) {
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
const jsxRuntime = { jsx, jsxs: jsx };

test("Productos declara su lista como ancla del stack y mantiene las protecciones", async () => {
  const Stack = Object.assign(() => {}, { Screen: "Stack.Screen", Protected: "Stack.Protected" });
  const module = await loadModule("../app/(tabs)/products/_layout.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "expo-router": { Stack },
    "@/components/ui/notebook": { useNotebookHeader: () => ({}) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => false }) },
  });
  assert.equal(module.unstable_settings?.anchor, "index");
  const children = module.default().props.children;
  assert.equal(children[0].props.name, "index");
  assert.equal(children[1].props.guard, false);
  assert.equal(children[2].props.name, "[id]/index");
  assert.equal(children[3].props.guard, false);
});

test("Ventas declara su lista como ancla del stack", async () => {
  const Stack = Object.assign(() => {}, { Screen: "Stack.Screen", Protected: "Stack.Protected" });
  const module = await loadModule("../app/(tabs)/sales/_layout.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "expo-router": { Stack },
    "@/components/ui/notebook": { NotebookScene: "NotebookScene", useNotebookHeader: () => ({}) },
    "@/contexts/sales-draft/provider": { SalesDraftProvider: "SalesDraftProvider" },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
  });
  assert.equal(module.unstable_settings?.anchor, "index");
});

function content(node) {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node !== "object") return String(node);
  return Array.isArray(node) ? node.map(content).join(" ") : content(node.props?.children);
}

function findAlert(node) {
  if (!node || typeof node !== "object") return undefined;
  if (node.type === "Pressable" && content(node).includes("Producto de prueba")) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = findAlert(child);
    if (result) return result;
  }
}

function findByAccessibilityLabel(node, label) {
  if (!node || typeof node !== "object") return undefined;
  if (node.props?.accessibilityLabel === label) return node;
  for (const child of [node.props?.children].flat(Infinity)) {
    const result = findByAccessibilityLabel(child, label);
    if (result) return result;
  }
}

test("abrir la alerta desde Dashboard pide cargar el ancla bajo el detalle correcto", async () => {
  const navigation = [];
  const module = await loadModule("../app/(tabs)/index.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "expo-router": { router: { push: (...args) => navigation.push(args) }, useFocusEffect: () => {} },
    react: { useState: (value) => [value, () => {}], useMemo: (calculate) => calculate(), useCallback: (callback) => callback },
    "react-native": {
      ...Object.fromEntries(["Pressable", "RefreshControl", "ScrollView", "Text", "View"].map((name) => [name, name])),
      useColorScheme: () => "light",
    },
    "@/contexts/AuthContext": { useAuth: () => ({ user: { role: "BUSINESS_OWNER" } }) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
    "@/components/auth/Permission": { Permission: "Permission" },
    "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
    "@/contexts/products": { useProducts: () => ({ products: [{ id: 42, shortname: "Producto de prueba", stock: 1, stockMin: 5, isActive: true }] }) },
    "@/contexts/purchases": { usePurchases: () => ({ purchases: [] }) },
    "@/contexts/sales": { useSales: () => ({ sales: [] }) },
  });
  const home = module.default();
  const alert = findAlert(home.type(home.props));
  assert.ok(alert, "Debe existir la alerta del producto");
  alert.props.onPress();
  assert.deepEqual(navigation, [[
    { pathname: "/(tabs)/products/[id]", params: { id: "42" } },
    { withAnchor: true },
  ]]);
});

test("abrir Caja desde Dashboard conserva el ancla del stack de Más", async () => {
  const navigation = [];
  const module = await loadModule("../app/(tabs)/index.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "expo-router": { router: { push: (...args) => navigation.push(args) }, useFocusEffect: () => {} },
    react: { useState: (value) => [value, () => {}], useMemo: (calculate) => calculate(), useCallback: (callback) => callback },
    "react-native": {
      ...Object.fromEntries(["Pressable", "RefreshControl", "ScrollView", "Text", "View"].map((name) => [name, name])),
      useColorScheme: () => "light",
    },
    "@/contexts/AuthContext": { useAuth: () => ({ user: { role: "BUSINESS_OWNER" } }) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
    "@/components/auth/Permission": { Permission: "Permission" },
    "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
    "@/contexts/products": { useProducts: () => ({ products: [] }) },
    "@/contexts/purchases": { usePurchases: () => ({ purchases: [] }) },
    "@/contexts/sales": { useSales: () => ({ sales: [] }) },
  });
  const home = module.default();
  const cashButton = findByAccessibilityLabel(home.type(home.props), "Abrir Caja");
  assert.ok(cashButton);
  cashButton.props.onPress();
  assert.deepEqual(navigation, [[
    { pathname: "/(tabs)/more/cash-closing" },
    { withAnchor: true },
  ]]);
});

test("la tarjeta Ventas del día abre Ventas conservando su ancla", async () => {
  const navigation = [];
  const module = await loadModule("../app/(tabs)/index.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "expo-router": { router: { push: (...args) => navigation.push(args) }, useFocusEffect: () => {} },
    react: { useState: (value) => [value, () => {}], useMemo: (calculate) => calculate(), useCallback: (callback) => callback },
    "react-native": {
      ...Object.fromEntries(["Pressable", "RefreshControl", "ScrollView", "Text", "View"].map((name) => [name, name])),
      useColorScheme: () => "light",
    },
    "@/contexts/AuthContext": { useAuth: () => ({ user: { role: "BUSINESS_OWNER" } }) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
    "@/components/auth/Permission": { Permission: "Permission" },
    "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
    "@/contexts/products": { useProducts: () => ({ products: [] }) },
    "@/contexts/purchases": { usePurchases: () => ({ purchases: [] }) },
    "@/contexts/sales": { useSales: () => ({ sales: [] }) },
  });
  const home = module.default();
  const salesCard = findByAccessibilityLabel(home.type(home.props), "Ver ventas del día");
  assert.ok(salesCard);
  salesCard.props.onPress();
  assert.deepEqual(navigation, [[
    { pathname: "/(tabs)/sales" },
    { withAnchor: true },
  ]]);
});

test("Nueva venta desde Dashboard carga el ancla del stack de Ventas", async () => {
  const navigation = [];
  const module = await loadModule("../app/(tabs)/index.tsx", {
    "react/jsx-runtime": jsxRuntime,
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "expo-router": { router: { push: (...args) => navigation.push(args) }, useFocusEffect: () => {} },
    react: { useState: (value) => [value, () => {}], useMemo: (calculate) => calculate(), useCallback: (callback) => callback },
    "react-native": {
      ...Object.fromEntries(["Pressable", "RefreshControl", "ScrollView", "Text", "View"].map((name) => [name, name])),
      useColorScheme: () => "light",
    },
    "@/contexts/AuthContext": { useAuth: () => ({ user: { role: "BUSINESS_OWNER" } }) },
    "@/hooks/usePermissions": { usePermissions: () => ({ can: () => true }) },
    "@/components/auth/Permission": { Permission: ({ children }) => children },
    "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
    "@/contexts/products": { useProducts: () => ({ products: [] }) },
    "@/contexts/purchases": { usePurchases: () => ({ purchases: [] }) },
    "@/contexts/sales": { useSales: () => ({ sales: [] }) },
  });
  const home = module.default();
  const newSaleButton = findByAccessibilityLabel(home.type(home.props), "Nueva venta");
  assert.ok(newSaleButton);
  newSaleButton.props.onPress();
  assert.deepEqual(navigation, [[
    { pathname: "/(tabs)/sales/new" },
    { withAnchor: true },
  ]]);
});
