// Espera a que acaben las animaciones y transiciones de element y sus hijos.
// Acaban también si se cancelan (al pasar a otro Pokémon), y sin animaciones
// (movimiento reducido) no hay nada que esperar. Las infinitas (los saltitos
// de ¡Atrápalo!) no acaban nunca: no se esperan
export const animationsEnd = (element: Element) =>
  Promise.allSettled(
    element
      .getAnimations({ subtree: true })
      .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity)
      .map(({ finished }) => finished)
  )
