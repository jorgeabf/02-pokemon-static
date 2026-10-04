// Una altura en metros, redondeada, que es como la entiende un niño
export const sayHeight = (meters: number) => {
  if (meters < 1) return `${Math.round(meters * 100)} centímetros`
  const rounded = Math.round(meters)
  return rounded === 1 ? 'un metro' : `${rounded} metros`
}
