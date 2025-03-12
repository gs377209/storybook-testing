import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import dts from "vite-plugin-dts";
import { libInjectCss } from "vite-plugin-lib-inject-css";
import { glob } from "glob";
import { coverageConfigDefaults } from "vitest/config";

const __dirname = dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: resolve(__dirname, "tsconfig.lib.json"),
    }),
    libInjectCss(),
  ],
  build: {
    copyPublicDir: false,
    lib: {
      entry: resolve(__dirname, "lib/main.ts"),
      // name: "main",
      // the proper extensions will be added
      // fileName: "storybook-testing",
      formats: ["es"],
    },
    rollupOptions: {
      // make sure to externalize deps that shouldn't be bundled
      // into your library
      external: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "@emotion/react",
        "@emotion/styled",
      ],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          // jsxRuntime: "react/jsx-runtime",
        },
        assetFileNames: "assets/[name][extname]",
        entryFileNames: "[name].js",
      },
      input: Object.fromEntries(
        glob
          .sync("lib/**/*.{ts,tsx}", {
            ignore: ["lib/**/*.d.ts", "lib/**/*.stories.tsx"],
          })
          .map((file) => [
            // The name of the entry point
            // lib/nested/foo.ts becomes nested/foo
            relative("lib", file.slice(0, file.length - extname(file).length)),
            // The absolute path to the entry file
            // lib/nested/foo.ts becomes /project/lib/nested/foo.ts
            fileURLToPath(new URL(file, import.meta.url)),
          ])
      ),
    },
  },
  test: {
    coverage: {
      // 👇 Add this
      exclude: [
        ...coverageConfigDefaults.exclude,
        "**/.storybook/**",
        // 👇 This pattern must align with the `stories` property of your `.storybook/main.ts` config
        "**/*.stories.*",
        // 👇 This pattern must align with the output directory of `storybook build`
        "**/storybook-static/**",
      ],
    },
  },
});
