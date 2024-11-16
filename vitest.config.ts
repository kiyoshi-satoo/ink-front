import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    globals: true,
    environment: "jsdom", // Set the environment to jsdom for DOM manipulation
  },
});
