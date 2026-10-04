import { ALBUM_MEDALS } from 'consts/album-medals'

// Los números de los Pokémon que Ibai ha atrapado, guardados en el móvil
const ALBUM_KEY = 'album'

export const getAlbum = (): number[] =>
  JSON.parse(localStorage.getItem(ALBUM_KEY) ?? '[]')

// Devuelve si es nuevo en el álbum
export const addToAlbum = (id: number) => {
  const album = getAlbum()

  if (album.includes(id)) return false

  localStorage.setItem(ALBUM_KEY, JSON.stringify([...album, id]))
  return true
}

// La medalla que se gana justo al llegar a tantos Pokémon, si la hay
export const medalAt = (count: number) =>
  ALBUM_MEDALS.find((medal) => medal === count)
