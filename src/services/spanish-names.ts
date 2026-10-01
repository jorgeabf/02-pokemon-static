const POKEMON_COUNT = 151
// De 10 en 10 reutiliza conexiones: es más rápido y estable que las 151 a la vez
const BATCH_SIZE = 10

const fetchSpecies = async (id: number) => {
  const resp = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
  return (await resp.json()) as PokemonSpeciesResponse
}

const fetchSpanishNames = async (): Promise<Record<string, string>> => {
  const ids = Array.from({ length: POKEMON_COUNT }, (_, index) => index + 1)
  const species: PokemonSpeciesResponse[] = []

  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE)
    species.push(...(await Promise.all(batch.map(fetchSpecies))))
  }

  return Object.fromEntries(
    species.map(({ name, names }) => [
      name,
      names.find(({ language }) => language.name === 'es')?.name ?? name
    ])
  )
}

let spanishNames: Promise<Record<string, string>> | undefined

// Se piden una sola vez y se comparten entre todas las páginas.
// Si fallan, no se guarda el error para reintentar en la siguiente petición.
export const getSpanishNames = () => {
  spanishNames ??= fetchSpanishNames().catch((error) => {
    spanishNames = undefined
    throw error
  })
  return spanishNames
}
