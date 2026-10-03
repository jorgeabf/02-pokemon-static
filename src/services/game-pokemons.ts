import { POKEMON_HABITATS } from 'consts/pokemon-habitats'
import type { Evolution } from 'interfaces/evolution'
import type {
  EvolvingPokemon,
  GamePokemon,
  WeighedPokemon,
  WildPokemon
} from 'interfaces/game-pokemon'
import { getCryUrl, getPokemonImage } from 'services/pokemon-images'
import {
  getCaptureRates,
  getEvolutionChains,
  getHabitats,
  getSpanishNames,
  getTypes,
  getWeights,
  toSpokenName
} from 'services/pokemon-species'

// Los 151 con su nombre en PokeAPI y su número, que va al final de la url
const getPokemonList = async () => {
  const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  const { results } = (await resp.json()) as PokemonListResponse

  return results.map(({ name, url }) => ({
    name,
    id: Number(url.split('/').at(-2))
  }))
}

// Lo que usan los juegos: número, nombre, voz, imagen y grito (servidos
// desde la web)
const toGamePokemon = async (
  id: number,
  spanishName: string
): Promise<GamePokemon> => ({
  id,
  name: spanishName,
  spokenName: toSpokenName(spanishName),
  image: await getPokemonImage(id),
  cry: getCryUrl(id)
})

export const getGamePokemons = async (): Promise<GamePokemon[]> => {
  const pokemons = await getPokemonList()
  const spanishNames = await getSpanishNames()

  return Promise.all(
    pokemons.map(({ name, id }) => toGamePokemon(id, spanishNames[name] ?? name))
  )
}

// Las cadenas que tienen alguna evolución, desde su primera fase
export const getEvolvingPokemons = async (): Promise<EvolvingPokemon[]> => {
  const pokemons = await getGamePokemons()
  const chains = await getEvolutionChains()

  // getGamePokemons() va por orden de número: el #1 está en la posición 0
  const toEvolving = ({ id, evolvesTo }: Evolution): EvolvingPokemon => ({
    ...pokemons[id - 1],
    evolvesTo: evolvesTo.map(toEvolving)
  })

  return chains.filter(({ evolvesTo }) => evolvesTo.length > 0).map(toEvolving)
}

// Los 151 para ¡Atrápalo!, cada uno con el fondo de su hábitat
export const getWildPokemons = async (): Promise<WildPokemon[]> => {
  const pokemons = await getPokemonList()
  const spanishNames = await getSpanishNames()
  const habitats = await getHabitats()
  const captureRates = await getCaptureRates()

  return Promise.all(
    pokemons.map(async ({ name, id }) => ({
      ...(await toGamePokemon(id, spanishNames[name] ?? name)),
      captureRate: captureRates[name],
      tile: POKEMON_HABITATS.find(({ key }) => key === habitats[name])?.tile ?? ''
    }))
  )
}

// Los 151 con su peso, para ¿Cuál pesa más?
export const getWeighedPokemons = async (): Promise<WeighedPokemon[]> => {
  const pokemons = await getPokemonList()
  const spanishNames = await getSpanishNames()
  const weights = await getWeights()

  return Promise.all(
    pokemons.map(async ({ name, id }) => ({
      ...(await toGamePokemon(id, spanishNames[name] ?? name)),
      weight: weights[name]
    }))
  )
}

// Los de cada tipo (fire, water…), para Fuego, agua, planta
export const getPokemonsByType = async (
  types: string[]
): Promise<Record<string, GamePokemon[]>> => {
  const pokemons = await getPokemonList()
  const spanishNames = await getSpanishNames()
  const pokemonTypes = await getTypes()

  return Object.fromEntries(
    await Promise.all(
      types.map(async (type) => [
        type,
        await Promise.all(
          pokemons
            .filter(({ name }) => pokemonTypes[name].includes(type))
            .map(({ name, id }) => toGamePokemon(id, spanishNames[name] ?? name))
        )
      ])
    )
  )
}
