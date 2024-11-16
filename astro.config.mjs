import { defineConfig } from "astro/config";
import icon from "astro-icon";
import sassGlobImports from "vite-plugin-sass-glob-import";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  devToolbar: {
    enabled: false,
  },
  integrations: [
    // icon({}),
    icon({
      iconDir: "src/assets/icons",
      svgoOptions: {
        multipass: true,
        plugins: [
          {
            name: "preset-default",
            params: {
              overrides: {
                // customize default plugin options
                inlineStyles: {
                  onlyMatchedOnce: false,
                },
                // or disable plugins
                removeDoctype: false,
              },
            },
          },
        ],
      },
    }),

    tailwind(),
  ],
  compressHTML: false,
  build: {
    assets: "assets",
  },
  vite: {
    build: {
      minify: true,
      emptyOutDir: true,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          entryFileNames: "scripts.js",
          assetFileNames: (assetInfo) => {
            return assetInfo.name === "style.css"
              ? `${assetInfo.name}` // задается имя и папка (корень) для css
              : `assets/${assetInfo.name}`; // задается имя и папка картинкам
          },
        },
      },
    },
    plugins: [sassGlobImports()],
    css: {
      devSourcemap: true,
      transformer: "postcss",
    },
  },
});
