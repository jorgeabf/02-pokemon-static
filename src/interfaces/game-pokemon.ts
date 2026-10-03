export interface GamePokemon {
  name: string
  spokenName: string
  image: string
  cry: string
}

// Con las fases en que se puede convertir, para el juego ¡Evoluciona!
export interface EvolvingPokemon extends GamePokemon {
  evolvesTo: EvolvingPokemon[]
}
