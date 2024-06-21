interface Pokemon {
  name: string
  url: string
}

interface PokemonListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Pokemon[]
}
