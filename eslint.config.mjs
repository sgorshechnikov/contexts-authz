import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "no-console": "error",
      "@typescript-eslint/no-inferrable-types": "off",
      "@typescript-eslint/no-namespace": "off"
    },
  },
  {
    ignores: ["node_modules", "build", "dist", "bin", "**/__generated/", "**/dist/"],
  },
);
