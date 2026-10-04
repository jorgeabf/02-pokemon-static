# Pokémons de Ibai

Una web, instalable como app, con los 151 Pokémon de la primera generación, 12 juegos y un álbum para ir llenando. Está hecha para Ibai, que tiene 5 años: todavía no lee palabras, así que todo son dibujos y botones grandes, y lo que haría falta leer se dice en voz alta. Funciona sin conexión.

Publicada en <https://pokemons-ibai.netlify.app>.

## Qué tiene

- **Pokémons:** los 151 en una sola página, con saltos al 1, 25, 50, 75, 100, 125 y 150. Cada uno tiene su ficha:
  - imagen, grito, el nombre en voz alta y la descripción de la Pokédex leída;
  - la versión brillante y el sprite animado;
  - la cadena de evolución;
  - «¿Más grande que yo?»: Ibai al lado del Pokémon, a escala;
  - flechas al anterior y al siguiente.
- **Favoritos:** se guardan con el corazón de la ficha.
- **Juegos:** 12, en dos bloques.
  - Los que llenan el álbum: ¡Atrápalo!, ¿Dónde está…?, Escondite en la cueva, ¡Dale de comer!, ¿Cuántos hay? (contar hasta 20 y sumar) y Parejas.
  - Los demás: ¿Quién es ese Pokémon?, Pokébola sorpresa, ¡Evoluciona!, ¿Cuál pesa más?, Fuego, agua, planta y ¿Cuál es más alto?
- **¿Dónde viven?:** los Pokémon por sitios (bosque, mar, cueva…). La cueva está a oscuras y se busca con una linterna que sigue al dedo.
- **Mi álbum:**
  - los Pokémon que ha conseguido en los juegos, y en sombra los que faltan;
  - medallas a los 10, 25, 50, 100 y 151;
  - al completarlo se puede empezar otra vez, y se gana una copa.
- **Hora de descansar:**
  - un adulto pone un tiempo manteniendo pulsada la Pokéball del menú;
  - un minuto antes, la voz avisa;
  - al acabar, Snorlax se duerme y tapa la app hasta que el adulto lo quita (manteniéndolo pulsado y tocando la palabra que se pide).

## Pensada para un niño pequeño

- Ibai lee los números y sabe los colores, así que eso sí puede aparecer escrito. Las palabras, no: van en voz alta.
- Botones grandes, solo con icono. El nombre va en `aria-label`.
- Cualquier elemento con `data-speak` dice su texto al tocarlo.
- Antes de borrar algo, se pregunta.
- En los juegos no se repite ningún Pokémon hasta que han salido todos.
- Todo se prueba en el móvil a 375×812 y a 320×640. La ficha cabe sin scroll en los 151 Pokémon.

## Cómo está hecha

- **[Astro 7](https://astro.build)**: web estática con `ClientRouter`.
- **Tailwind CSS 4**: los colores, las animaciones y las clases propias están en `src/styles/global.css`.
- **Solid**: solo en Favoritos.
- **astro-icon**: iconos de Phosphor, sacados de Iconify.
- **Datos de [PokeAPI](https://pokeapi.co)**, que se piden al compilar (`src/services`): nombres en español, descripciones, pesos, alturas, tipos, hábitats y evoluciones.
- **Imágenes y sonidos:** las imágenes, también las brillantes, se copian a la web en AVIF, y los gritos y los GIF animados también (`/cries/[id].ogg`, `/animated/[id].gif`, `/animated/shiny/[id].gif`). Mientras se usa, la app no pide nada a GitHub.
- **Sin conexión:** un service worker propio (`integrations/service-worker`). Al compilar escribe `dist/sw.js` con la lista de todos los archivos (unos 1130, 25 MB) y una huella de cada uno, y en cada versión el móvil solo baja lo que ha cambiado. Mientras guarda, una barra debajo del menú enseña cuánto lleva.
- **Lo de Ibai** (álbum, copas, favoritos, temporizador) se guarda en el `localStorage` del móvil.
- **La voz** es `speechSynthesis` en español. Sin conexión solo habla si Android tiene los datos de voz en español instalados.

```text
src/
  pages/        las páginas, más cries/ y animated/, que copian los sonidos y GIF de PokeAPI
  components/   shared (menú, confeti, medalla…), pokemons y games
  scripts/      lo que corre en el navegador: voz, barajas, álbum, linterna, hora de descansar…
  services/     datos e imágenes de PokeAPI, al compilar
  consts/       medallas, sitios, bayas, la altura de Ibai…
  icons/        los SVG
  styles/       global.css
integrations/
  service-worker/
```

## Comandos

Con Node 24 (`.node-version`) y pnpm:

| Comando        | Qué hace                                                                  |
| :------------- | :------------------------------------------------------------------------ |
| `pnpm install` | Instala las dependencias                                                  |
| `pnpm dev`     | Desarrollo en <http://localhost:7171>                                     |
| `pnpm build`   | Comprueba los tipos (`astro check`) y compila en `dist/`. Necesita conexión: pide los datos a PokeAPI |
| `pnpm preview` | Sirve lo compilado en <http://localhost:7172>, con el service worker     |

- Los puertos son propios, para que el service worker no se meta en otros proyectos.
- No hay que compilar con `pnpm dev` arrancado, porque se estropea la caché de Vite.
- Después de añadir un icono a `src/icons`, hay que volver a arrancar `pnpm dev`.

## Flujo de trabajo

1. Los cambios se hacen en `develop`, con mensajes en español (`feat:`, `fix:`, `style:`…).
2. PR de `develop` a `master`.
3. Netlify despliega `master` solo.
4. Después de desplegar, se comprueba en la web publicada.
