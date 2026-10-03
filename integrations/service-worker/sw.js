// Guarda la app entera al instalarse para poder jugar sin conexión. Al
// compilar, index.mjs pone delante VERSION y PRECACHE (url → huella)

const PRECACHE_CACHE = `pokemons-${VERSION}`
// Lo brillante no se baja al instalar: se guarda la primera vez que se ve y se
// conserva entre versiones (las imágenes de GitHub no cambian)
const SHINY_CACHE = 'pokemons-brillantes'
const PARALLEL_DOWNLOADS = 6

// Con la huella en la clave, un archivo que no ha cambiado se reconoce en la
// caché de la versión anterior
const cacheKey = (url) => new URL(`${url}?v=${PRECACHE[url]}`, location.origin).href

// Baja lo que falte. Si se corta, lo ya guardado se queda en la caché de esta
// versión y el siguiente intento sigue desde ahí. Lo que no ha cambiado se
// copia de la versión anterior: cada despliegue baja solo lo nuevo
const precache = async () => {
  const cache = await caches.open(PRECACHE_CACHE)
  const saved = new Set((await cache.keys()).map(({ url }) => url))
  const pending = Object.keys(PRECACHE).filter((url) => !saved.has(cacheKey(url)))

  const download = async () => {
    for (let url = pending.pop(); url; url = pending.pop()) {
      const key = cacheKey(url)
      const response = (await caches.match(key)) ?? (await fetch(url, { cache: 'no-cache' }))

      // Las urls de la lista no redirigen; si alguna lo hiciera, Chrome no
      // dejaría usar esa respuesta para cargar la página
      if (!response.ok || response.redirected) {
        throw new Error(`${url}: ${response.status} ${response.url}`)
      }

      await cache.put(key, response)
    }
  }

  await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, download))
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

// Solo quedan esta versión y lo brillante
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== PRECACHE_CACHE && name !== SHINY_CACHE)
            .map((name) => caches.delete(name))
        )
      )
      .then(() => self.clients.claim())
  )
})

// Los enlaces a las páginas van sin la barra final (/pokemons/pikachu)
const toPrecacheUrl = (pathname) =>
  [pathname, `${pathname}/`].find((url) => url in PRECACHE)

const fromPrecache = async (request, url) =>
  (await caches.match(cacheKey(url), { cacheName: PRECACHE_CACHE })) ?? fetch(request)

// Se pide con CORS (GitHub lo permite) para guardar una respuesta normal: una
// opaca Chrome la cuenta como varios MB
const fromShinyCache = async (url) => {
  const cache = await caches.open(SHINY_CACHE)
  const cached = await cache.match(url)

  if (cached) return cached

  const response = await fetch(url, { mode: 'cors', credentials: 'omit' })

  if (response.ok) await cache.put(url, response.clone())

  return response
}

// Las páginas, también las que pide el ClientRouter con fetch, salen de la
// caché. De GitHub solo se pide ya lo brillante
self.addEventListener('fetch', (event) => {
  const { request } = event

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  if (url.origin === location.origin) {
    const precacheUrl = toPrecacheUrl(url.pathname)
    if (precacheUrl) event.respondWith(fromPrecache(request, precacheUrl))
  } else if (url.hostname === 'raw.githubusercontent.com') {
    event.respondWith(fromShinyCache(url.href))
  }
})
