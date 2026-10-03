// Solo lo que se usa de /pokemon/{id}, que trae mucho más (movimientos…)
interface PokemonResponse {
  name: string
  // En hectogramos: 4600 son 460 kg
  weight: number
  // En decímetros: 88 son 8,8 m
  height: number
  types: {
    slot: number
    type: {
      name: string
      url: string
    }
  }[]
}
