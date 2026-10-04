// Una altura en metros, exacta y como se dice la de una persona: «40
// centímetros», «un metro», «un metro 40» (la voz dice «un metro cuarenta»),
// «8 metros 80». Redondeada a metros enteros, 1,5 m sonaba «2 metros», y 1,4
// m, «un metro», como Ibai, aunque fuera más grande que él
export const sayHeight = (meters: number) => {
  // PokeAPI da decímetros: los centímetros van de 10 en 10
  const centimeters = Math.round(meters * 100)

  if (centimeters < 100) return `${centimeters} centímetros`

  const wholeMeters = Math.floor(centimeters / 100)
  const rest = centimeters % 100
  const inMeters = wholeMeters === 1 ? 'un metro' : `${wholeMeters} metros`
  return rest === 0 ? inMeters : `${inMeters} ${rest}`
}
