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
const dependencies = {
  "react/jsx-runtime": { jsx, jsxs: jsx, Fragment: "Fragment" },
  "react-native": {
    ...Object.fromEntries(["ScrollView", "Pressable", "Text", "FlatList", "View", "TextInput", "RefreshControl", "Switch"].map((name) => [name, name])),
    Keyboard: { dismiss: () => {} },
  },
};
const filters = await loadModule("../utils/product-filters.ts");
const components = await loadModule("../components/products/ProductCategoryFilters.tsx", dependencies);
const product = { categoryId: 1, shortname: "Agua", stock: 2, stockMin: 5, isActive: true };
const defaults = { categoryId: null, searchText: "", lowStockOnly: false, inactiveOnly: false };

test("stock bajo incluye por debajo, en mínimo y sin stock, pero no por encima", () => {
  for (const [stock, stockMin, expected] of [[2, 5, true], [5, 5, true], [6, 5, false], [0, 0, true], [1, 0, false]]) {
    assert.equal(filters.matchesProductFilters({ ...product, stock, stockMin }, { ...defaults, lowStockOnly: true }), expected);
  }
});

test("los filtros se combinan con categoría, búsqueda e inactivos sin alterar el comportamiento por defecto", () => {
  assert.equal(filters.matchesProductFilters({ ...product, isActive: false }, defaults), true);
  const selected = { ...defaults, categoryId: "1", searchText: "  AGUA ", inactiveOnly: true, lowStockOnly: true };
  assert.equal(filters.matchesProductFilters({ ...product, isActive: false }, selected), true);
  assert.equal(filters.matchesProductFilters(product, selected), false);
  assert.equal(filters.matchesProductFilters({ ...product, categoryId: 2, isActive: false }, selected), false);
  assert.equal(filters.matchesProductFilters({ ...product, shortname: "Té", isActive: false }, selected), false);
});

const categories = [{ id: 1, name: "Bebidas" }, { id: 2, name: "Almacén" }];

test("los pills tienen orden estable, estado accesible y permiten desactivar cada filtro", () => {
  const changes = [];
  const tree = components.ProductCategoryFilters({
    categories, categoryId: "1", lowStockOnly: true, inactiveOnly: true,
    onCategoryChange: (value) => changes.push(value),
    onLowStockChange: (value) => changes.push(value),
    onInactiveChange: (value) => changes.push(value),
  });
  const pills = tree.props.children;
  assert.deepEqual(pills.map((pill) => pill.props.accessibilityLabel), ["Stock bajo", "Bebidas", "Almacén", "Inactivos"]);
  assert.deepEqual(pills.map((pill) => pill.props.accessibilityState.selected), [true, true, false, true]);
  pills.forEach((pill) => pill.props.onPress());
  assert.deepEqual(changes, [false, null, "2", false]);
});

const products = [
  { ...product, id: 1 },
  { ...product, id: 2, categoryId: 2, shortname: "Arroz", stock: 5 },
  { ...product, id: 3, shortname: "Té", stock: 6 },
  { ...product, id: 4, shortname: "Agua inactiva", isActive: false },
  { ...product, id: 5, categoryId: 2, shortname: "Sin stock", stock: 0, stockMin: 0 },
];

function find(node, type) {
  if (!node || typeof node !== "object") return undefined;
  if (Array.isArray(node)) {
    for (const child of node) { const match = find(child, type); if (match) return match; }
    return undefined;
  }
  if (node.type === type) return node;
  if (typeof node.type === "function") return find(node.type(node.props), type);
  return find(node.props?.children, type);
}

async function renderScreen(path) {
  const states = [];
  let cursor = 0;
  const module = await loadModule(path, {
    ...dependencies,
    react: {
      useState: (initial) => {
        const index = cursor++;
        if (!(index in states)) states[index] = initial;
        return [states[index], (value) => { states[index] = typeof value === "function" ? value(states[index]) : value; }];
      },
      useMemo: (callback) => callback(),
      useCallback: (callback) => callback,
    },
    "expo-router": { router: {}, useFocusEffect: () => {} },
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "react-native-safe-area-context": { useSafeAreaInsets: () => ({ bottom: 0 }) },
    "@/components/products": { NewProductButton: "NewProductButton" },
    "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
    "@/components/products/ProductCategoryFilters": components,
    "@/utils/product-filters": filters,
    "@/contexts/products": { useProducts: () => ({ products, categories }) },
    "@/contexts/purchase-draft": { usePurchaseDraft: () => ({ items: [] }) },
    "@/contexts/sales-draft": { useSalesDraft: () => ({ addItems: () => {} }) },
  });
  return () => { cursor = 0; return module.default(); };
}

for (const [name, path] of [
  ["Productos", "../app/(tabs)/products/index.tsx"],
  ["Nueva compra", "../app/(tabs)/purchases/new/index.tsx"],
  ["Selección de venta", "../app/(tabs)/sales/new/select-products.tsx"],
]) {
  test(`${name}: integra el orden y filtra al pulsar stock bajo, categoría e inactivos`, async () => {
    const render = await renderScreen(path);
    const pills = () => find(render(), "ScrollView").props.children;
    const ids = () => find(render(), "FlatList").props.data.map((item) => item.id);
    assert.deepEqual(pills().map((pill) => pill.props.accessibilityLabel), ["Stock bajo", "Bebidas", "Almacén", "Inactivos"]);
    assert.deepEqual(ids(), [1, 2, 3, 4, 5]);
    pills()[0].props.onPress();
    assert.deepEqual(ids(), [1, 2, 4, 5]);
    pills()[1].props.onPress();
    assert.deepEqual(ids(), [1, 4]);
    pills().at(-1).props.onPress();
    assert.deepEqual(ids(), [4]);
    pills().at(-1).props.onPress();
    pills()[1].props.onPress();
    pills()[0].props.onPress();
    assert.deepEqual(ids(), [1, 2, 3, 4, 5]);
  });
}

test("Nueva compra mantiene el filtro existente de solo faltantes", async () => {
  const render = await renderScreen("../app/(tabs)/purchases/new/index.tsx");
  find(render(), "Switch").props.onValueChange(true);
  assert.deepEqual(find(render(), "FlatList").props.data.map((item) => item.id), [1, 4]);
});
