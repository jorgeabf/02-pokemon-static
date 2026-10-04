// Linterna (.flashlight en global.css): a oscuras salvo un círculo de luz en
// --x, --y. CSS no sabe dónde está el dedo: se lo pasa este script. Basta con
// importarlo en la página que tenga una .flashlight (la cueva de ¿Dónde
// viven? y Escondite en la cueva); como módulo, se ejecuta una sola vez
const followFinger = (flashlight: HTMLElement) => {
  const moveLight = ({ clientX, clientY }: PointerEvent) => {
    const { left, top } = flashlight.getBoundingClientRect()
    flashlight.style.setProperty('--x', `${clientX - left}px`)
    flashlight.style.setProperty('--y', `${clientY - top}px`)
  }

  // Con el dedo quieto encima de un Pokémon la luz sigue al dedo: el menú
  // de Chrome y arrastrar la imagen ya los quita MainLayout en toda la app
  flashlight.addEventListener('pointerdown', moveLight)
  flashlight.addEventListener('pointermove', moveLight)
}

document.addEventListener('astro:page-load', () => {
  const flashlight = document.querySelector<HTMLElement>('.flashlight')

  if (flashlight) followFinger(flashlight)
})
