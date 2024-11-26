import withNuxt from "./.nuxt/eslint.config.mjs";
import pluginVue from "eslint-plugin-vue";
import { FlatCompat } from "@eslint/eslintrc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
    baseDirectory: __dirname
});


export default withNuxt([
  ...pluginVue.configs["flat/strongly-recommended"],
  ...compat.config({
    env: { node: true },
    extends: ["plugin:@typescript-eslint/recommended"],
    parser: "vue-eslint-parser",
    parserOptions: {
      parser: "@typescript-eslint/parser",
      ecmaVersion: "latest",
      sourceType: "module",
    },
    plugins: ["@typescript-eslint"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-explicit-any":"warn",
    },
  }),
  {
    rules: {
      "vue/max-attributes-per-line": [
        "error",
        {
          singleline: {
            max: 1,
          },
          multiline: {
            max: 1,
          },
        },
      ],
      "semi": ["error", "always"],
      "vue/require-v-for-key": "off",
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing":"off",
      "vue/valid-v-for":"off",
      quotes: ["error", "double"],
    },
  },
]);
