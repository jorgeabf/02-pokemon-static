import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { createSignal, For, type Component } from 'solid-js'
import FavoritePokemonCard from './FavoritePokemonCard'

interface Props {
  spanishNames: Record<string, string>
  // La imagen de cada número, generada al compilar
  images: Record<number, string>
}

const getLocalStoragePokemons = (): FavoritePokemon[] => {
  const favoritePokemons = localStorage.getItem('favorites')
  return favoritePokemons ? JSON.parse(favoritePokemons) : []
}

const FavoritePokemons: Component<Props> = ({ spanishNames, images }) => {
  const [pokemons, setPokemons] = createSignal<FavoritePokemon[]>(
    getLocalStoragePokemons()
  )

  return (
    <div class='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
      <For each={pokemons()}>
        {(pokemon) => (
          <FavoritePokemonCard
            pokemon={pokemon}
            spanishName={spanishNames[pokemon.name] ?? pokemon.name}
            imageSrc={images[pokemon.id]}
          />
        )}
      </For>
    </div>
  )
}

export default FavoritePokemons
