import type { Evolution } from 'interfaces/evolution'

const POKEMON_COUNT = 151
// De 10 en 10 reutiliza conexiones: es más rápido y estable que todas a la vez
const BATCH_SIZE = 10

const fetchJson = async <T>(url: string) => {
  const resp = await fetch(url)
  return (await resp.json()) as T
}

const fetchInBatches = async <T>(urls: string[]) => {
  const results: T[] = []

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    results.push(...(await Promise.all(batch.map((url) => fetchJson<T>(url)))))
  }

  return results
}

// Se piden una sola vez y se comparten entre todas las páginas.
// Si fallan, no se guarda el error para reintentar en la siguiente petición.
const cached = <T>(load: () => Promise<T>) => {
  let result: Promise<T> | undefined

  return () => {
    result ??= load().catch((error) => {
      result = undefined
      throw error
    })
    return result
  }
}

const getAllSpecies = cached(() =>
  fetchInBatches<PokemonSpeciesResponse>(
    Array.from(
      { length: POKEMON_COUNT },
      (_, index) => `https://pokeapi.co/api/v2/pokemon-species/${index + 1}`
    )
  )
)

// Varias especies comparten cadena: cada una se pide una vez
const getAllEvolutionChains = cached(async () => {
  const species = await getAllSpecies()
  const urls = new Set(species.map(({ evolution_chain }) => evolution_chain.url))

  return fetchInBatches<EvolutionChainResponse>([...urls])
})

export const getSpanishNames = async (): Promise<Record<string, string>> => {
  const species = await getAllSpecies()

  return Object.fromEntries(
    species.map(({ name, names }) => [
      name,
      names.find(({ language }) => language.name === 'es')?.name ?? name
    ])
  )
}

export const getHabitats = async (): Promise<Record<string, string>> => {
  const species = await getAllSpecies()

  return Object.fromEntries(
    species.map(({ name, habitat }) => [name, habitat?.name ?? ''])
  )
}

export const getCaptureRates = async (): Promise<Record<string, number>> => {
  const species = await getAllSpecies()

  return Object.fromEntries(
    species.map(({ name, capture_rate }) => [name, capture_rate])
  )
}

// Texto de la Pokédex en español; el más corto, que es el más fácil de
// escuchar para un niño. Los textos traen saltos de línea de los juegos.
export const getDescriptions = async (): Promise<Record<string, string>> => {
  const species = await getAllSpecies()

  return Object.fromEntries(
    species.map(({ name, flavor_text_entries }) => {
      const texts = flavor_text_entries
        .filter(({ language }) => language.name === 'es')
        .map(({ flavor_text }) => flavor_text.replace(/\s+/g, ' ').trim())
      const shortest = texts.reduce(
        (a, b) => (b.length < a.length ? b : a),
        texts[0] ?? ''
      )
      return [name, shortest]
    })
  )
}

// Solo quedan los 151: si sobra uno, sus evoluciones ocupan su sitio.
// Sin Pichu la cadena empieza en Pikachu; sin Tyrogue, Hitmonlee y
// Hitmonchan se quedan cada uno solo, porque no evolucionan entre sí.
const keepFirstGeneration = ({
  species,
  evolves_to
}: EvolutionChainLink): Evolution[] => {
  const id = Number(species.url.split('/').at(-2))
  const evolvesTo = evolves_to.flatMap(keepFirstGeneration)

  return id <= POKEMON_COUNT ? [{ id, name: species.name, evolvesTo }] : evolvesTo
}

const getNames = ({ name, evolvesTo }: Evolution): string[] => [
  name,
  ...evolvesTo.flatMap(getNames)
]

// Cada cadena desde su primer Pokémon (también las de uno solo)
export const getEvolutionChains = async (): Promise<Evolution[]> => {
  const chains = await getAllEvolutionChains()

  return chains.flatMap(({ chain }) => keepFirstGeneration(chain))
}

// Cada Pokémon con su cadena entera, desde el primero de ella
export const getEvolutions = async (): Promise<Record<string, Evolution>> => {
  const firsts = await getEvolutionChains()

  return Object.fromEntries(
    firsts.flatMap((first) => getNames(first).map((name) => [name, first]))
  )
}

// La voz no lee bien ♀ y ♂: se dicen como en el anime en español
export const toSpokenName = (spanishName: string) =>
  spanishName.replace('♀', ' hembra').replace('♂', ' macho')
