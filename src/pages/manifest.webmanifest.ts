import type { APIRoute } from 'astro'
import { SITE_INFO } from 'consts/site-info'

const { SITE_TITLE, SITE_DESCRIPTION, THEME_COLOR } = SITE_INFO

// Permite instalar la web como app en el móvil (pantalla completa e icono)
export const GET: APIRoute = () =>
  Response.json({
    name: SITE_TITLE,
    short_name: SITE_TITLE,
    description: SITE_DESCRIPTION,
    lang: 'es',
    // Sin id, Chrome identifica la app instalada por su start_url, que era
    // /pokemons/1/: fijándolo, cambiar start_url no la convierte en otra app
    id: '/pokemons/1/',
    start_url: '/pokemons/',
    scope: '/',
    display: 'standalone',
    background_color: THEME_COLOR,
    theme_color: THEME_COLOR,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable'
      }
    ]
  })
