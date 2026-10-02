interface EvolutionChainLink {
  species: {
    name: string
    url: string
  }
  evolves_to: EvolutionChainLink[]
}

interface EvolutionChainResponse {
  id: number
  chain: EvolutionChainLink
}
