interface PokemonSpeciesName {
  name: string
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
}
