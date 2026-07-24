import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  prettier,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Design prototype reference — not project code.
    "docs/**",
    // Embedded design bundles served verbatim (interactive demos) — third-party
    // handoff code kept byte-faithful, not linted. See .prettierignore (public).
    "public/demos/**",
  ]),
]);

export default eslintConfig;
