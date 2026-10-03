interface PokemonSpeciesName {
  name: string
  language: {
    name: string
    url: string
  }
}

interface PokemonSpeciesFlavorText {
  flavor_text: string
  language: {
    name: string
    url: string
  }
}

interface PokemonSpeciesResponse {
  name: string
  names: PokemonSpeciesName[]
  // Solo falta en Pokémon de generaciones posteriores a la primera
  habitat: {
    name: string
    url: string
  } | null
  flavor_text_entries: PokemonSpeciesFlavorText[]
  evolution_chain: {
    url: string
  }
}
