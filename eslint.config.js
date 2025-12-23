import js from "@eslint/js"
import globals from "globals"
import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import stylistic from "@stylistic/eslint-plugin"
import { defineConfig } from "eslint/config"

export default defineConfig([
  {
    // 必须在单独块中来全局忽略
    ignores: ["dist/**", "src/**"]
  },
  {
    files: ["**/*.{js,jsx,mjs}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      "react": pluginReact,
      "@stylistic": stylistic
    },
    extends: [
      js.configs.recommended,
      pluginReact.configs.flat.recommended,
      pluginReact.configs.flat["jsx-runtime"],
      pluginReactHooks.configs.flat.recommended,
      stylistic.configs.recommended
    ],
    rules: {
      // React
      "react/prop-types": "off",

      // React Hooks
      "react-hooks/set-state-in-effect": "off",

      // Stylistic
      "@stylistic/arrow-parens": ["error", "always"],
      "@stylistic/brace-style": "off",
      "@stylistic/comma-dangle": ["error", "never"],
      "@stylistic/jsx-first-prop-new-line": ["error", "multiline"],
      "@stylistic/jsx-one-expression-per-line": ["error", { allow: "non-jsx" }],
      "@stylistic/jsx-quotes": ["error", "prefer-double"],
      "@stylistic/multiline-ternary": ["error", "always-multiline"],
      "@stylistic/quotes": ["error", "double"]
    },
    settings: {
      react: { version: "detect" }
    }
  }
])
