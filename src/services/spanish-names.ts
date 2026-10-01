const POKEMON_COUNT = 151

const fetchSpanishNames = async (): Promise<Record<string, string>> => {
  const species = await Promise.all(
    Array.from({ length: POKEMON_COUNT }, async (_, index) => {
      const resp = await fetch(
        `https://pokeapi.co/api/v2/pokemon-species/${index + 1}`
      )
      return (await resp.json()) as PokemonSpeciesResponse
    })
  )

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
