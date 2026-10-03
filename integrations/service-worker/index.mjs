import { createHash } from 'node:crypto'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, relative, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

// Lo que no se guarda para jugar sin conexión: la configuración de Netlify y
// el propio service worker
const EXCLUDED = new Set(['_headers', '_redirects', 'sw.js'])

const hash = (content) => createHash('sha256').update(content).digest('hex').slice(0, 12)

// pokemons/pikachu/index.html → /pokemons/pikachu/
const toUrl = (path) => `/${path.split(sep).join('/')}`.replace(/(^|\/)index\.html$/, '$1')

// Al compilar, escribe dist/sw.js: la plantilla sw.js con delante la lista de
// todo lo que hay en dist (url → huella de su contenido) y la versión, que es
// la huella de toda la lista. Si cambia cualquier archivo, cambia sw.js y el
// navegador instala la versión nueva
/** @returns {import('astro').AstroIntegration} */
export const serviceWorker = () => ({
  name: 'service-worker',
  hooks: {
    'astro:build:done': async ({ dir, logger }) => {
      const root = fileURLToPath(dir)
      const entries = await readdir(root, { recursive: true, withFileTypes: true })
      const files = entries
        .filter((entry) => entry.isFile())
        .map((entry) => relative(root, join(entry.parentPath, entry.name)))
        .filter((path) => !EXCLUDED.has(path))
        .sort()

      const precache = {}
      let bytes = 0

      for (const path of files) {
        const content = await readFile(join(root, path))
        precache[toUrl(path)] = hash(content)
        bytes += content.length
      }

      const version = hash(JSON.stringify(precache))
      const template = await readFile(new URL('sw.js', import.meta.url), 'utf-8')

      await writeFile(
        join(root, 'sw.js'),
        `const VERSION = '${version}'\nconst PRECACHE = ${JSON.stringify(precache)}\n\n${template}`
      )

      logger.info(
        `sw.js ${version}: ${files.length} archivos, ${(bytes / 1024 / 1024).toFixed(1)} MB`
      )
    }
  }
})
