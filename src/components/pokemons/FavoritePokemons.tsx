import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { createSignal, For, Show, type Component } from 'solid-js'
import SvgIcon from '@components/shared/SvgIcon'
import heartOutlineIcon from '../../icons/heart-outline.svg?raw'
import FavoritePokemonCard from './FavoritePokemonCard'

interface Props {
  spanishNames: Record<string, string>
  spokenNames: Record<string, string>
  // La imagen de cada número, generada al compilar
  images: Record<number, string>
}

const getLocalStoragePokemons = (): FavoritePokemon[] => {
  const favoritePokemons = localStorage.getItem('favorites')
  return favoritePokemons ? JSON.parse(favoritePokemons) : []
}

const FavoritePokemons: Component<Props> = ({ spanishNames, spokenNames, images }) => {
  const [pokemons, setPokemons] = createSignal<FavoritePokemon[]>(
    getLocalStoragePokemons()
  )

  // La lista es de aquí: al borrar el último sale la explicación
  const deletePokemon = (id: number) => {
    const updatedPokemons = getLocalStoragePokemons().filter((p) => p.id !== id)
    localStorage.setItem('favorites', JSON.stringify(updatedPokemons))
    setPokemons(updatedPokemons)
  }

  return (
    <Show
      when={pokemons().length > 0}
      fallback={
        // Sin favoritos: el corazón vacío de la ficha, que al tocarlo explica
        // cómo se guardan (Ibai no lee)
        <button
          aria-label='¿Cómo se guarda un favorito?'
          data-speak='Toca el corazón de un Pokémon para guardarlo aquí'
          class='grid place-items-center w-full max-w-xs mx-auto mt-8 p-8 rounded-2xl bg-slate-900 border border-slate-600 transition-transform active:scale-95'
        >
          <SvgIcon
            svg={heartOutlineIcon}
            class='[&>svg]:size-40'
          />
        </button>
      }
    >
      <div class='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4'>
        <For each={pokemons()}>
          {(pokemon) => (
            <FavoritePokemonCard
              pokemon={pokemon}
              spanishName={spanishNames[pokemon.name] ?? pokemon.name}
              spokenName={spokenNames[pokemon.name] ?? pokemon.name}
              imageSrc={images[pokemon.id]}
              onDelete={() => deletePokemon(pokemon.id)}
            />
          )}
        </For>
      </div>
    </Show>
  )
}

export default FavoritePokemons
