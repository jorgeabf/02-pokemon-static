import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { createSignal, Show, type Component } from 'solid-js'

interface Props {
  pokemon: FavoritePokemon
  spanishName: string
}

const FavoritePokemonCard: Component<Props> = ({ pokemon, spanishName }) => {
  const [isvisible, setIsvisible] = createSignal(true)
  const imageSrc = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`
  let dialog!: HTMLDialogElement

  const askDelete = () => {
    dialog.returnValue = ''
    dialog.showModal()
  }

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
            alt={spanishName}
            width={140}
            height={140}
            class='mx-auto'
            style={{ 'view-transition-name': `${pokemon.name}-image` }}
          />
          <h3 class='capitalize'>{spanishName}</h3>
        </a>
        <button
          onClick={askDelete}
          class='bg-red-700 text-center text-white px-2 py-1 rounded-sm w-full mt-4'
        >
          Borrar
        </button>
        {/* form method=dialog cierra el diálogo y deja el botón pulsado en returnValue */}
        <dialog
          ref={dialog}
          onClose={() => dialog.returnValue === 'yes' && deleteFavoritePokemon()}
          class='m-auto w-72 p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-600 backdrop:bg-black/70'
        >
          <form
            method='dialog'
            class='grid gap-4 text-center'
          >
            <img
              src={imageSrc}
              alt=''
              width={140}
              height={140}
              class='mx-auto'
            />
            <p class='text-xl font-bold'>¿Borrar a {spanishName}?</p>
            <div class='grid grid-cols-2 gap-4'>
              <button
                value='no'
                class='btn-big bg-slate-600'
              >
                No
              </button>
              <button
                value='yes'
                class='btn-big bg-red-700'
              >
                Sí
              </button>
            </div>
          </form>
        </dialog>
      </article>
    </Show>
  )
}

export default FavoritePokemonCard
