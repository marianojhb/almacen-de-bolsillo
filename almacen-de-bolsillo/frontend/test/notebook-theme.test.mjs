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
    (name) => { assert.ok(name in dependencies, `Dependencia no simulada: ${name}`); return dependencies[name]; }, exports,
  );
  return exports;
}

const constants = await loadModule("../constants/notebook.ts");

function luminance(hex) {
  const rgb = hex.slice(1).match(/.{2}/g).map((part) => parseInt(part, 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4);
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
}

test("la tinta y el texto secundario tienen contraste de lectura en papel claro y oscuro", () => {
  for (const palette of [constants.notebook, constants.notebook.dark]) {
    for (const text of [palette.ink, palette.muted]) {
      for (const surface of [palette.paper, palette.surface]) {
        const values = [luminance(text), luminance(surface)].sort((a, b) => b - a);
        assert.ok((values[0] + 0.05) / (values[1] + 0.05) >= 4.5);
      }
    }
  }
});

test("el papel es decorativo, no intercepta toques y adapta renglones a la pantalla", async () => {
  const jsx = (type, props) => ({ type, props });
  const module = await loadModule("../components/ui/notebook.tsx", {
    "react/jsx-runtime": { jsx, jsxs: jsx },
    "@expo/vector-icons": { Ionicons: "Ionicons" },
    "@/constants/notebook": constants,
    "react-native": {
      Text: "Text", View: "View", StyleSheet: { absoluteFillObject: {}, hairlineWidth: 0.5 },
      useWindowDimensions: () => ({ height: 812, width: 375 }), useColorScheme: () => "dark",
    },
  });
  const paper = module.NotebookPaper();
  assert.equal(paper.props.pointerEvents, "none");
  assert.equal(paper.props.importantForAccessibility, "no-hide-descendants");
  assert.equal(paper.props.children[0].length, Math.ceil(812 / 32));
  assert.equal(paper.props.style[1].backgroundColor, constants.notebook.dark.paper);
  assert.equal(module.useNotebookHeader().headerTintColor, constants.notebook.dark.ink);
  assert.equal(module.NotebookPaper({ appearance: "light" }).props.style[1].backgroundColor, constants.notebook.paper);
});

test("las fechas del anotador se agrupan de más recientes a antiguas sin mutar los datos", async () => {
  const { groupRecordsByDay } = await loadModule("../utils/notebook-sections.ts");
  const records = [
    { id: 1, createdAt: "2026-10-20T12:00:00Z" },
    { id: 2, createdAt: "2026-10-25T12:00:00Z" },
    { id: 3, createdAt: "2026-10-25T13:00:00Z" },
  ];
  const sections = groupRecordsByDay(records);
  assert.deepEqual(sections.map((section) => section.data.map((record) => record.id)), [[3, 2], [1]]);
  assert.deepEqual(records.map((record) => record.id), [1, 2, 3]);
  assert.deepEqual(groupRecordsByDay([]), []);
  assert.equal(groupRecordsByDay([{ createdAt: "inválida" }])[0].title, "Sin fecha");
});

test("la fuente manuscrita se distribuye localmente con su licencia", async () => {
  const font = await readFile(new URL("../assets/fonts/Caveat.ttf", import.meta.url));
  const license = await readFile(new URL("../assets/fonts/OFL.txt", import.meta.url), "utf8");
  assert.ok(font.length > 10000);
  assert.match(license, /SIL OPEN FONT LICENSE/);
});

test("Productos y Compras mantienen buscador y creación en la misma fila", async () => {
  const jsx = (type, props) => ({ type, props });
  for (const path of ["../app/(tabs)/products/index.tsx", "../app/(tabs)/purchases/index.tsx"]) {
    const module = await loadModule(path, {
      "react/jsx-runtime": { jsx, jsxs: jsx },
      react: { useState: (initial) => [initial, () => {}], useMemo: (callback) => callback(), useCallback: (callback) => callback },
      "react-native": { View: "View", Text: "Text", TextInput: "TextInput", Pressable: "Pressable", FlatList: "FlatList", RefreshControl: "RefreshControl", Keyboard: { dismiss: () => {} } },
      "expo-router": { router: {}, useFocusEffect: () => {} },
      "@/components/ui/notebook": { NotebookHeading: "NotebookHeading" },
      "@/components/products": { NewProductButton: "NewProductButton" },
      "@/components/products/ProductCategoryFilters": { ProductCategoryFilters: "ProductCategoryFilters" },
      "@/utils/product-filters": {},
      "@/contexts/products": { useProducts: () => ({ products: [], categories: [] }) },
      "@/contexts/purchases": { usePurchases: () => ({ purchases: [], totalPurchases: 0 }) },
      "@/components/auth/Permission": { Permission: "Permission" },
    });
    const row = module.default().props.children.find((child) =>
      child?.type === "View" && Array.isArray(child.props.children) && child.props.children.some((element) => element?.type === "TextInput"),
    );
    assert.ok(row);
    assert.match(row.props.className, /flex-row/);
    assert.doesNotMatch(row.props.className, /flex-wrap/);
    assert.equal(row.props.children.length, 2);
    assert.match(row.props.children[0].props.className, /min-w-0 flex-1/);
    assert.ok(["NewProductButton", "Permission"].includes(row.props.children[1].type));
  }
});

test("Agregar usa etiqueta corta y conserva el permiso y la navegación de creación", async () => {
  const jsx = (type, props) => ({ type, props });
  for (const canCreate of [true, false]) {
    const pushes = [];
    const module = await loadModule("../components/products/NewProductButton.tsx", {
      "react/jsx-runtime": { jsx, jsxs: jsx },
      "react-native": { Pressable: "Pressable", Text: "Text" },
      "expo-router": { router: { push: (href) => pushes.push(href) } },
      "@/hooks/usePermissions": { usePermissions: () => ({ can: () => canCreate }) },
    });
    const button = module.NewProductButton();
    if (canCreate) {
      assert.equal(button.props.children.props.children, "+ Agregar");
      assert.equal(button.props.accessibilityLabel, "Agregar producto");
      button.props.onPress();
      assert.deepEqual(pushes, ["/products/new"]);
    } else {
      assert.equal(button, null);
    }
  }
});
