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
  // De 3 (legendarios) a 255 (los más fáciles de atrapar)
  capture_rate: number
  flavor_text_entries: PokemonSpeciesFlavorText[]
  evolution_chain: {
    url: string
  }
}
