// Uno al azar que no sea el actual, para que no salga el mismo dos veces seguidas
export const pickOther = <T>(items: T[], current?: T) => {
  const candidates = items.filter((item) => item !== current)
  return candidates[Math.floor(Math.random() * candidates.length)]
}
