import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { createSignal, For } from 'solid-js'
import FavoritePokemonCard from './FavoritePokemonCard'

const getLocalStoragePokemons = (): FavoritePokemon[] => {
  const favoritePokemons = localStorage.getItem('favorites')
  return favoritePokemons ? JSON.parse(favoritePokemons) : []
}

const FavoritePokemons = () => {
  const [pokemons, setPokemons] = createSignal<FavoritePokemon[]>(
    getLocalStoragePokemons()
  )

  return (
    <div class='flex flex-wrap gap-4'>
      <For each={pokemons()}>
        {(pokemon) => <FavoritePokemonCard pokemon={pokemon} />}
      </For>
    </div>
  )
}

export default FavoritePokemons
