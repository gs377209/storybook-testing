// @vitest-environment jsdom

import { test } from "vitest";

import { composeStories } from "@storybook/react";

import * as stories from "../Button.stories";
import { fireEvent, screen, expect as storybookExpect } from "@storybook/test";

const { Secondary } = composeStories(stories);

test("Tests Secondary", async () => {
  await Secondary.run();

  const buttonElement = screen.getByRole("button", {
    name: "Button",
  });

  await fireEvent.click(buttonElement);

  const isFormValid = screen.getByRole("button");
  await storybookExpect(isFormValid).toBeInTheDocument();
});
