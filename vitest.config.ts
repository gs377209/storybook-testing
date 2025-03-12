import {
  coverageConfigDefaults,
  defineConfig,
  mergeConfig,
} from "vitest/config";
import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

import viteConfig from "./vite.config";

export default mergeConfig(
  viteConfig,
  defineConfig({
    plugins: [
      storybookTest({
        // The location of your Storybook config, main.js|ts
        configDir: path.join(dirname, ".storybook"),
        // This should match your package.json script to run Storybook
        // The --ci flag will skip prompts and not open a browser
        storybookScript: "npm run storybook -- --ci",
        storybookUrl: process.env.SB_URL,
      }),
    ],
    test: {
      // Enable browser mode
      browser: {
        enabled: true,
        // Make sure to install Playwright
        provider: "playwright",
        headless: true,
        instances: [
          {
            browser: "chromium",
            headless: true,
          },
        ],
      },
      setupFiles: ["./.storybook/vitest.setup.ts"],
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
  })
);
