import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineWorkspace } from "vitest/config";

import { storybookTest } from "@storybook/experimental-addon-test/vitest-plugin";

const dirname =
  typeof __dirname !== "undefined"
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/writing-tests/test-addon
export default defineWorkspace([
  "./vitest.config.ts",
  {
    extends: "vite.config.ts",
    plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/writing-tests/test-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, ".storybook"),
        storybookScript: "npm run storybook -- --ci",
        storybookUrl: process.env.SB_URL,
      }),
    ],
    test: {
      name: "storybook",
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
      setupFiles: [".storybook/vitest.setup.ts"],
    },
  },
]);
