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
