// Fuego, agua, planta: como piedra, papel o tijera. Cada uno gana al de
// beats, y la frase lo explica. key es el tipo en PokeAPI; starter, el
// Pokémon de Ibai (Charmander, Squirtle y Bulbasaur)
export const BATTLE_ELEMENTS = [
  {
    key: 'fire',
    name: 'Fuego',
    starter: 4,
    beats: 'grass',
    phrase: '¡El fuego quema la planta!',
    icon: 'flame',
    tile: 'from-orange-400 to-red-600'
  },
  {
    key: 'water',
    name: 'Agua',
    starter: 7,
    beats: 'fire',
    phrase: '¡El agua apaga el fuego!',
    icon: 'drop',
    tile: 'from-sky-400 to-blue-700'
  },
  {
    key: 'grass',
    name: 'Planta',
    starter: 1,
    beats: 'water',
    phrase: '¡La planta se bebe el agua!',
    icon: 'leaf',
    tile: 'from-lime-400 to-green-700'
  }
]
