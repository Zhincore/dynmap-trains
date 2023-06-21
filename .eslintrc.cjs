module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  extends: ["plugin:@typescript-eslint/recommended"],
  plugins: ["import", "@typescript-eslint"],
  ignorePatterns: ["*.cjs"],
  settings: {
    "svelte3/typescript": require("typescript"),
    "import/internal-regex": "^(~|\\$)",
    "import/resolver": {
      typescript: {},
    },
  },
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    tsconfigRootDir: __dirname,
    project: ["./tsconfig.json"],
  },
  env: {
    browser: true,
  },
  rules: {
    "import/order": ["warn", { groups: ["builtin", "external", "internal", "parent", "sibling"] }],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
  },
};
