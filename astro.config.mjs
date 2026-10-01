import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
  site: 'https://pokemons-ibai.netlify.app',
  integrations: [icon(), solidJs()],
  vite: {
    plugins: [tailwindcss()]
  },
  redirects: {
    '/': '/pokemons/1/'
  }
});
