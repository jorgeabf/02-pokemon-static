// Uno al azar que no sea el actual, para que no salga el mismo dos veces seguidas
export const pickOther = <T>(items: T[], current?: T) => {
  const candidates = items.filter((item) => item !== current)
  return candidates[Math.floor(Math.random() * candidates.length)]
}

// Una copia desordenada (Fisher-Yates: todos los órdenes igual de probables)
export const shuffle = <T>(items: T[]) => {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// n distintos al azar
export const pickSome = <T>(items: T[], n: number) => shuffle(items).slice(0, n)

// Una baraja: cada llamada saca uno, en un orden al azar, sin repetir ninguno
// hasta que han salido todos; entonces vuelve a barajar. Con pickOther, en 10
// rondas de entre 151 se repetía alguno el 22 % de las veces
export const createDeck = <T>(items: T[]) => {
  let pending: T[] = []
  let last: T | undefined

  return () => {
    if (pending.length === 0) {
      pending = shuffle(items)
      // Se saca por el final: si al volver a barajar ahí está el último que
      // salió, se cambia con el primero para que no salga dos veces seguidas
      if (pending.length > 1 && pending.at(-1) === last) {
        ;[pending[0], pending[pending.length - 1]] = [pending[pending.length - 1], pending[0]]
      }
    }
    last = pending.pop() as T
    return last
  }
}

// n distintos de una baraja: justo al volver a barajar podría salir uno que
// ya ha salido en esta tanda, y se saca otro
export const drawDistinct = <T>(draw: () => T, n: number) => {
  const drawn = new Set<T>()
  while (drawn.size < n) drawn.add(draw())
  return [...drawn]
}
