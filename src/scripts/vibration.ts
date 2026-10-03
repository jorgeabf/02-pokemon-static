// Vibra con cada meneo de la Pokébola: ball-shake (global.css) dura 1,5 s y se
// mece del 0 al 16 %, del 33 al 49 % y del 66 al 82 %. Es decir: 240 ms
// vibrando, 255 parado, y así hasta los tres
const SHAKE_PATTERN = [240, 255, 240, 255, 240]

// Empieza cuando empieza la animación y para si se corta (al pasar a otro
// Pokémon). Sin animación (movimiento reducido) no vibra
export const vibrateWithShake = async (container: Element) => {
  const shake = container
    .getAnimations({ subtree: true })
    .find(
      (animation) =>
        animation instanceof CSSAnimation && animation.animationName === 'ball-shake'
    )

  if (!shake || !('vibrate' in navigator)) return

  try {
    await shake.ready
  } catch {
    // Se ha cortado antes de empezar
    return
  }

  navigator.vibrate(SHAKE_PATTERN)
  shake.finished.catch(() => navigator.vibrate(0))
}
