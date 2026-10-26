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
    (name) => {
      assert.ok(name in dependencies, `Dependencia no simulada: ${name}`);
      return dependencies[name];
    },
    exports,
  );
  return exports;
}

test("una selección manual no se revierte mientras se hidrata la preferencia guardada", async () => {
  let resolveStoredPreference;
  const storedPreference = new Promise((resolve) => {
    resolveStoredPreference = resolve;
  });
  const effects = [];
  const colorSchemeChanges = [];
  const stateChanges = [];
  const context = { Provider: "ThemePreferenceProvider" };
  const jsx = (type, props) => ({ type, props });

  const module = await loadModule("../contexts/ThemePreferenceContext.tsx", {
    "react/jsx-runtime": { jsx },
    "@react-native-async-storage/async-storage": {
      getItem: () => storedPreference,
      setItem: () => Promise.resolve(),
    },
    nativewind: {
      useColorScheme: () => ({
        setColorScheme: (preference) => colorSchemeChanges.push(preference),
      }),
    },
    react: {
      createContext: () => context,
      useCallback: (callback) => callback,
      useContext: () => null,
      useEffect: (effect, dependencies) => effects.push({ effect, dependencies }),
      useMemo: (factory) => factory(),
      useRef: (current) => ({ current }),
      useState: (initial) => [initial, (value) => stateChanges.push(value)],
    },
  });

  const provider = module.ThemePreferenceProvider({ children: "Contenido" });
  const hydrationEffect = effects.find(({ dependencies }) => dependencies.length === 0);
  assert.ok(hydrationEffect);
  hydrationEffect.effect();
  assert.deepEqual(colorSchemeChanges, []);

  provider.props.value.setThemePreference("light");
  resolveStoredPreference("dark");
  await storedPreference;
  await Promise.resolve();

  assert.deepEqual(colorSchemeChanges, ["light"]);
  assert.deepEqual(stateChanges, ["light"]);
});
