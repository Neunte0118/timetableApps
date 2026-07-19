import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import { defineConfig } from "eslint/config";

export default defineConfig([
  js.configs.recommended,

  ...tseslint.configs.recommended,

  pluginReact.configs.flat.recommended,

  reactHooks.configs.flat.recommended,

  {
    files: ["**/*.{ts,tsx}"],

    plugins: {
      "react-refresh": reactRefresh,
    },

    languageOptions: {
      globals: globals.browser,
    },

    settings: {
      react: {
        version: "detect",
      },
    },

    rules: {
      "react/react-in-jsx-scope": "off",

      "react-hooks/set-state-in-effect": "off",
      "react-hooks/exhaustive-deps": "warn",

      "react-refresh/only-export-components": "warn",

      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    }
  },
]);