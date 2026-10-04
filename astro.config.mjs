import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";

import solidJs from "@astrojs/solid-js";
import { serviceWorker } from "./integrations/service-worker/index.mjs";

// https://astro.build/config
export default defineConfig({
  site: 'https://pokemons-ibai.netlify.app',
  // Puertos propios: el service worker se queda en localhost:<puerto> y en el
  // 4321 de siempre se metería en otros proyectos. Preview, aparte de dev,
  // para que no sirva en dev las páginas que guardó de la web compilada
  server: ({ command }) => ({ port: command === 'preview' ? 7172 : 7171 }),
  integrations: [icon(), solidJs(), serviceWorker()],
  vite: {
    plugins: [tailwindcss()]
  },
  // Solo optimiza (AVIF, copia en la web) las imágenes de sitios autorizados
  image: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'raw.githubusercontent.com',
        pathname: '/PokeAPI/sprites/**'
      }
    ]
  },
  // Páginas que llevan a otra (meta refresh, no 301): se guardan como las
  // demás para jugar sin conexión. La lista iba en 9 páginas y la app
  // instalada empieza en la 1 o vuelve a la última que tenía abierta: todas
  // llevan ahora a la lista entera
  redirects: {
    '/': '/pokemons/',
    ...Object.fromEntries(
      Array.from({ length: 9 }, (_, index) => [`/pokemons/${index + 1}`, '/pokemons/'])
    )
  }
});
