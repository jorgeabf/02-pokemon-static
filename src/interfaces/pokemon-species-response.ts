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
  color: {
    name: string
    url: string
  }
  flavor_text_entries: PokemonSpeciesFlavorText[]
}
