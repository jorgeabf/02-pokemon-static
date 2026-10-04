// Mientras guarda la app, la barra de debajo del menú (#offline-progress) dice
// cuánto lleva: el service worker avisa con cada archivo. Con todo guardado se
// pone verde y se va (data-done): ya se puede jugar sin cobertura
const showProgress = ({ data }: MessageEvent) => {
  if (data?.type !== 'precache-progress') return

  const progress = document.getElementById('offline-progress') as HTMLProgressElement

  if (!progress) return

  progress.hidden = false
  progress.max = data.total
  progress.value = data.saved
  progress.toggleAttribute('data-done', data.saved === data.total)
}

// Instala el service worker que guarda la app para jugar sin conexión
// (integrations/service-worker). Solo existe en la web compilada
export const registerServiceWorker = async () => {
  if (import.meta.env.DEV || !('serviceWorker' in navigator)) return

  // Antes de registrarlo, para no perder los primeros avisos
  navigator.serviceWorker.addEventListener('message', showProgress)

  const registration = await navigator.serviceWorker.register('/sw.js')

  // Que Android no borre lo guardado si el móvil se queda sin espacio
  navigator.storage.persist()

  // La app instalada puede pasar días abierta en segundo plano sin recargar:
  // al volver a ella, mira si hay una versión nueva. Sin conexión no puede
  // mirarlo, y no pasa nada: ya lo hará la próxima vez
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') registration.update().catch(() => {})
  })

  // Cuando entra una versión nueva, la siguiente navegación carga la página
  // entera (al cancelarla, el ClientRouter hace location.href): así no se
  // mezclan scripts de dos versiones ni se corta una partida a medias. La
  // primera instalación no cuenta: la página ya es de esa versión
  let hasController = Boolean(navigator.serviceWorker.controller)
  let updated = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (hasController) updated = true
    hasController = true
  })
  document.addEventListener('astro:before-preparation', (event) => {
    if (updated) event.preventDefault()
  })
}
