// Guarda la app entera al instalarse para poder jugar sin conexión. Al
// compilar, index.mjs pone delante VERSION y PRECACHE (url → huella)

const PRECACHE_CACHE = `pokemons-${VERSION}`
const PARALLEL_DOWNLOADS = 6

// Con la huella en la clave, un archivo que no ha cambiado se reconoce en la
// caché de la versión anterior
const cacheKey = (url) => new URL(`${url}?v=${PRECACHE[url]}`, location.origin).href

// Cuánto lleva guardado, para la barra de debajo del menú. También a las
// páginas que aún no controla: en la primera instalación, ninguna
const reportProgress = async (saved, total) => {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
  clients.forEach((client) => client.postMessage({ type: 'precache-progress', saved, total }))
}

// Baja lo que falte. Si se corta, lo ya guardado se queda en la caché de esta
// versión y el siguiente intento sigue desde ahí. Lo que no ha cambiado se
// copia de la versión anterior: cada despliegue baja solo lo nuevo
const precache = async () => {
  const cache = await caches.open(PRECACHE_CACHE)
  const saved = new Set((await cache.keys()).map(({ url }) => url))
  const pending = Object.keys(PRECACHE).filter((url) => !saved.has(cacheKey(url)))
  const total = Object.keys(PRECACHE).length
  let savedCount = total - pending.length

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
      // Sin esperar: avisar no frena las descargas
      reportProgress(++savedCount, total)
    }
  }

  await Promise.all(Array.from({ length: PARALLEL_DOWNLOADS }, download))
}

self.addEventListener('install', (event) => {
  event.waitUntil(precache().then(() => self.skipWaiting()))
})

// Solo queda esta versión. Se borran las anteriores y, de cuando lo brillante
// se pedía a GitHub, la caché donde se guardaba al verlo (pokemons-brillantes)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((name) => name !== PRECACHE_CACHE)
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

// Las páginas, también las que pide el ClientRouter con fetch, salen de la
// caché. Todo lo que usa la app está en la web: de fuera no se pide nada
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== location.origin) return

  const precacheUrl = toPrecacheUrl(url.pathname)
  if (precacheUrl) event.respondWith(fromPrecache(request, precacheUrl))
})
