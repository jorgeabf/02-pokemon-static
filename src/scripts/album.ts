import { ALBUM_MEDALS } from 'consts/album-medals'

// Los números de los Pokémon del álbum, guardados en el móvil: los que Ibai
// atrapa en ¡Atrápalo! y los que acierta a la primera en los juegos de
// buscar (¿Dónde está…?, Escondite, Dale de comer, ¿Cuántos hay?) y en
// Parejas, los 6 de la partida al acabarla
const ALBUM_KEY = 'album'
// Las veces que lo ha completado y vuelto a empezar: una copa por cada una.
// Aparte, para que vaciar el álbum no las borre
const ROUNDS_KEY = 'albumRounds'

export const getAlbum = (): number[] =>
  JSON.parse(localStorage.getItem(ALBUM_KEY) ?? '[]')

export const getRounds = () => Number(localStorage.getItem(ROUNDS_KEY)) || 0

// Con el álbum lleno, se vacía para volver a llenarlo y se gana una copa (las
// medallas salen de la cuenta: vuelven solas a cero). Devuelve su número
export const restartAlbum = () => {
  const rounds = getRounds() + 1

  localStorage.setItem(ROUNDS_KEY, String(rounds))
  localStorage.removeItem(ALBUM_KEY)
  return rounds
}

// Devuelve si es nuevo en el álbum
export const addToAlbum = (id: number) => {
  const album = getAlbum()

  if (album.includes(id)) return false

  localStorage.setItem(ALBUM_KEY, JSON.stringify([...album, id]))
  return true
}

// La medalla que se gana al pasar de before a after Pokémon, si la hay. Si
// entran varios a la vez (Parejas) y se pasa por dos, la mayor
const medalBetween = (before: number, after: number) =>
  ALBUM_MEDALS.findLast((medal) => medal > before && medal <= after)

// Con la última medalla ya los tiene todos: en su álbum puede empezar otra vez
const sayMedal = (medal: number) =>
  medal === ALBUM_MEDALS.at(-1)
    ? ` ¡Ya los tienes todos! ¡Medalla de ${medal}! Ve a tu álbum para empezar otra vez`
    : ` ¡Y has ganado la medalla de ${medal}!`

const sayNew = (added: number, total: number) => {
  if (added === 0) return ''
  if (total === 1) return ' ¡Nuevo en tu álbum!'
  return added === 1 ? ' ¡Uno nuevo en tu álbum!' : ` ¡${added} nuevos en tu álbum!`
}

// Apunta en el álbum los que aún no estén y prepara la celebración en
// prize: data-celebrate (confeti) si alguno es nuevo, y data-medal, con su
// número en [data-medal-number], si se gana una medalla. Una vez por ronda:
// clearAlbumReward la deja lista para la siguiente. Devuelve lo que añade la
// voz
export const rewardAlbum = (prize: HTMLElement, ids: number[]) => {
  const before = getAlbum().length
  const added = ids.filter(addToAlbum).length
  const medal = medalBetween(before, before + added)

  if (added > 0) prize.dataset.celebrate = ''

  if (medal) {
    const number = prize.querySelector('[data-medal-number]') as HTMLElement
    number.textContent = String(medal)
    prize.dataset.medal = ''
  }

  return `${sayNew(added, ids.length)}${medal ? sayMedal(medal) : ''}`
}

// Al empezar otra ronda
export const clearAlbumReward = (prize: HTMLElement) => {
  delete prize.dataset.celebrate
  delete prize.dataset.medal
}
