import { POKEMON_HABITATS } from 'consts/pokemon-habitats'
import type { Evolution } from 'interfaces/evolution'
import type {
  EvolvingPokemon,
  GamePokemon,
  WildPokemon
} from 'interfaces/game-pokemon'
import {
  getCaptureRates,
  getEvolutionChains,
  getHabitats,
  getSpanishNames,
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

// Lo que usan los juegos: nombre, voz, imagen y grito
const toGamePokemon = (id: number, spanishName: string): GamePokemon => ({
  name: spanishName,
  spokenName: toSpokenName(spanishName),
  image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
  cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
})

export const getGamePokemons = async (): Promise<GamePokemon[]> => {
  const pokemons = await getPokemonList()
  const spanishNames = await getSpanishNames()

  return pokemons.map(({ name, id }) => toGamePokemon(id, spanishNames[name] ?? name))
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

  return pokemons.map(({ name, id }) => ({
    ...toGamePokemon(id, spanishNames[name] ?? name),
    id,
    captureRate: captureRates[name],
    tile: POKEMON_HABITATS.find(({ key }) => key === habitats[name])?.tile ?? ''
  }))
}
