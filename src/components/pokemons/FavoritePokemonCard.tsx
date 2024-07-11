import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { createSignal, Show, type Component } from 'solid-js'

interface Props {
  pokemon: FavoritePokemon
}

const FavoritePokemonCard: Component<Props> = ({ pokemon }) => {
  const [isvisible, setIsvisible] = createSignal(true)
  const imageSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`

  const deleteFavoritePokemon = () => {
    const favoritePokemons = localStorage.getItem('favorites')
    if (favoritePokemons) {
      const updatedPokemons = JSON.parse(favoritePokemons).filter(
        (p: FavoritePokemon) => p.id !== pokemon.id
      )
      localStorage.setItem('favorites', JSON.stringify(updatedPokemons))
      setIsvisible(false)
    }
  }

  return (
    <Show when={isvisible()}>
      <article class='bg-slate-900 border border-slate-600 p-6 rounded-xl relative'>
        <a
          href={`/pokemons/${pokemon.name}`}
          class='block text-center'
        >
          <img
            src={imageSrc}
            alt={pokemon.name}
            width={140}
            height={140}
            style={{ 'view-transition-name': `${pokemon.name}-image` }}
          />
          <h3 class='capitalize'>{pokemon.name}</h3>
        </a>
        <button
          onClick={deleteFavoritePokemon}
          class='bg-red-700 text-center text-white px-2 py-1 rounded w-full mt-4'
        >
          Borrar
        </button>
      </article>
    </Show>
  )
}

export default FavoritePokemonCard
