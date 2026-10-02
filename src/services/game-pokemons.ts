import type { GamePokemon } from 'interfaces/game-pokemon'
import { getSpanishNames, toSpokenName } from 'services/pokemon-species'

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
