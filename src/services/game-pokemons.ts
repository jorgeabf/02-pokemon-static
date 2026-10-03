import type { Evolution } from 'interfaces/evolution'
import type { EvolvingPokemon, GamePokemon } from 'interfaces/game-pokemon'
import {
  getEvolutionChains,
  getSpanishNames,
  toSpokenName
} from 'services/pokemon-species'

// Los 151 con lo que usan los juegos: nombre, voz, imagen y grito
export const getGamePokemons = async (): Promise<GamePokemon[]> => {
  const resp = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151')
  const { results } = (await resp.json()) as PokemonListResponse
  const spanishNames = await getSpanishNames()

  return results.map(({ name, url }) => {
    const id = url.split('/').at(-2)
    const spanishName = spanishNames[name] ?? name

    return {
      name: spanishName,
      spokenName: toSpokenName(spanishName),
      image: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`,
      cry: `https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon/latest/${id}.ogg`
    }
  })
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
