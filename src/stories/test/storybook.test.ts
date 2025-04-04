// @vitest-environment jsdom

import type { Meta, StoryFn } from "@storybook/react";

import path from "path";
import { describe, expect, test } from "vitest";

import { composeStories } from "@storybook/react";

interface StoryFile {
  default: Meta;
  [name: string]: StoryFn | Meta;
}

const compose = (
  entry: StoryFile
): ReturnType<typeof composeStories<StoryFile>> => {
  try {
    return composeStories(entry);
  } catch (e) {
    throw new Error(
      `There was an issue composing stories for the module: ${JSON.stringify(
        entry
      )}, ${e as string}`
    );
  }
};

function getAllStoryFiles() {
  // Place the glob you want to match your story files
  const storyFiles = Object.entries(
    import.meta.glob<StoryFile>(
      "../../stories/**/*.(stories|story).@(js|jsx|mjs|ts|tsx)",
      {
        eager: true,
      }
    )
  );

  return storyFiles.map(([filePath, storyFile]) => {
    const storyDir = path.dirname(filePath);
    const componentName = path
      .basename(filePath)
      .replace(/\.(stories|story)\.[^/.]+$/, "");
    return { filePath, storyFile, componentName, storyDir };
  });
}

describe.skip("Stories Snapshots", () => {
  getAllStoryFiles().forEach(({ storyFile, componentName }) => {
    const meta = storyFile.default;
    const title = meta.title ?? componentName;

    describe(title, () => {
      const stories = Object.entries(compose(storyFile)).map(
        ([name, story]) => ({ name, story })
      );

      if (stories.length <= 0) {
        throw new Error(
          `No stories found for this module: ${title}. Make sure there is at least one valid story for this module.`
        );
      }

      stories.forEach(({ name, story }) => {
        test(name, async () => {
          await story.run();
          // Ensures a consistent snapshot by waiting for the component to render by adding a delay of 1 ms before taking the snapshot.
          await new Promise((resolve) => setTimeout(resolve, 1));
          // Defines the custom snapshot path location and file name
          const customSnapshotPath = `./__snapshots__/${componentName}.spec.ts.snap`;
          await expect(document.body.firstChild).toMatchFileSnapshot(
            customSnapshotPath
          );
        });
      });
    });
  });
});
