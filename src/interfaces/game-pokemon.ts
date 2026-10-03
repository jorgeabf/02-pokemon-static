export interface GamePokemon {
  name: string
  spokenName: string
  image: string
  cry: string
}

// Para el juego ¡Atrápalo!: su número (para el álbum), lo fácil que es de
// atrapar y el degradado de su hábitat, que hace de fondo
export interface WildPokemon extends GamePokemon {
  id: number
  captureRate: number
  tile: string
}

// Para el juego ¿Cuál pesa más?, con su peso en kilos
export interface WeighedPokemon extends GamePokemon {
  weight: number
}

// Con las fases en que se puede convertir, para el juego ¡Evoluciona!
export interface EvolvingPokemon extends GamePokemon {
  evolvesTo: EvolvingPokemon[]
}
