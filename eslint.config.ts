import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";

export default tseslint.config(
  {
    files: ["**/*.{js,ts,jsx,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
    },
    plugins: {
      prettier,
    },
    rules: {
      // TypeScript recommended rules
      ...tseslint.configs.recommended.rules,

      // Run Prettier as an ESLint rule
      "prettier/prettier": "error",
    },
  },
  {
    // Disables formatting-related ESLint rules so Prettier handles it
    rules: {
      ...require("eslint-config-prettier").rules,
    },
  },
);
