import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import importPlugin from "eslint-plugin-import";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      import: importPlugin,
    },
    rules: {
      // Enforce layer import boundaries in lib/
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            // UI layer cannot import from feature or data-access
            {
              target: "./lib/**/ui/**",
              from: "./lib/**/feature/**",
              message:
                "UI components cannot import from feature layer. UI must be pure and prop-driven.",
            },
            {
              target: "./lib/**/ui/**",
              from: "./lib/**/data-access/**",
              message:
                "UI components cannot import from data-access layer. UI must be pure and prop-driven.",
            },
            // Data-access layer cannot import from UI or feature
            {
              target: "./lib/**/data-access/**",
              from: "./lib/**/ui/**",
              message:
                "Data-access layer cannot import from UI layer. Keep data fetching separate from presentation.",
            },
            {
              target: "./lib/**/data-access/**",
              from: "./lib/**/feature/**",
              message:
                "Data-access layer cannot import from feature layer. Data-access should be independent.",
            },
            // Content layer cannot import anything from the same domain
            {
              target: "./lib/**/content/**",
              from: "./lib/**/ui/**",
              message: "Content layer should be pure data - cannot import UI.",
            },
            {
              target: "./lib/**/content/**",
              from: "./lib/**/feature/**",
              message: "Content layer should be pure data - cannot import feature.",
            },
            {
              target: "./lib/**/content/**",
              from: "./lib/**/data-access/**",
              message: "Content layer should be pure data - cannot import data-access.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
