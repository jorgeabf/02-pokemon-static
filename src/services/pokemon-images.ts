import { getImage } from 'astro:assets'
import { fetchInBatches } from 'services/fetch-in-batches'
import { POKEMON_IDS } from 'services/pokemon-species'

// Las imágenes y los gritos de PokeAPI están en GitHub. Al compilar se
// copian a la web, para servirlos desde aquí y poder jugar sin conexión
const SPRITES_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon'
const ITEMS_URL =
  'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items'
const CRIES_URL =
  'https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest'
const ANIMATED_PATH = 'versions/generation-v/black-white/animated'

// El tamaño original de official-artwork
const IMAGE_SIZE = 475
// getImage pide un tamaño, aunque un SVG se copia tal cual: con uno fijo sale
// un solo archivo por Pokémon, se pinte al tamaño que se pinte
const DRAWING_SIZE = 96

// Para og:image: quien crea la vista previa al compartir no lee AVIF
export const getRemoteImageUrl = (id: number | string) =>
  `${SPRITES_URL}/other/official-artwork/${id}.png`

// Lo brillante se sigue pidiendo a GitHub: no se guarda al instalar la app,
// sino la primera vez que se ve (ver integrations/service-worker/sw.js)
export const getShinyImageUrl = (id: number | string) =>
  `${SPRITES_URL}/other/official-artwork/shiny/${id}.png`

export const getShinyAnimatedUrl = (id: number | string) =>
  `${SPRITES_URL}/${ANIMATED_PATH}/shiny/${id}.gif`

// Los originales que copian src/pages/animated/ y src/pages/cries/
export const getRemoteAnimatedUrl = (id: number | string) =>
  `${SPRITES_URL}/${ANIMATED_PATH}/${id}.gif`

export const getRemoteCryUrl = (id: number | string) => `${CRIES_URL}/${id}.ogg`

// Las copias en la web
export const getAnimatedUrl = (id: number | string) => `/animated/${id}.gif`

export const getCryUrl = (id: number | string) => `/cries/${id}.ogg`

// Si falla, que falle el build: si no, se guardaría la página de error como si
// fuera el .ogg o el .gif
const readFile = async (resp: Response) => {
  if (!resp.ok) throw new Error(`${resp.url}: ${resp.status} ${resp.statusText}`)

  return resp.arrayBuffer()
}

// Para los endpoints que copian de GitHub un archivo por Pokémon: se bajan
// todos de 10 en 10 y cada página recibe el suyo
export const getCopiedFilePaths = async (getUrl: (id: number) => string) => {
  const files = await fetchInBatches(POKEMON_IDS.map(getUrl), readFile)

  return POKEMON_IDS.map((id, index) => ({
    params: { id: String(id) },
    props: { file: files[index] }
  }))
}

// La imagen grande en AVIF y a su tamaño original, la misma para tarjetas,
// ficha y juegos: pesa ~12 KB (el PNG, ~140) y en el móvil se ve nítida
export const getPokemonImage = async (id: number | string) => {
  const { src } = await getImage({
    src: getRemoteImageUrl(id),
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    format: 'avif'
  })
  return src
}

// El dibujo SVG de dream-world, copiado tal cual (Astro no rasteriza SVG)
const getPokemonDrawing = async (id: number) => {
  const { src } = await getImage({
    src: `${SPRITES_URL}/other/dream-world/${id}.svg`,
    width: DRAWING_SIZE,
    height: DRAWING_SIZE
  })
  return src
}

// Una baya (consts/berries) con el dibujo de dream-world: 90 px y ~3 KB, en el
// mismo estilo que los dibujos de los Pokémon (el de items/ mide 30 px). En
// AVIF y a su tamaño, que cambia un poco de una a otra
export const getBerryImage = async (key: string) => {
  const { src } = await getImage({
    src: `${ITEMS_URL}/dream-world/${key}-berry.png`,
    inferSize: true,
    format: 'avif'
  })
  return src
}

const byId = async (
  ids: number[],
  load: (id: number) => Promise<string>
): Promise<Record<number, string>> =>
  Object.fromEntries(await Promise.all(ids.map(async (id) => [id, await load(id)])))

export const getPokemonImages = (ids: number[]) => byId(ids, getPokemonImage)

export const getPokemonDrawings = (ids: number[]) => byId(ids, getPokemonDrawing)
