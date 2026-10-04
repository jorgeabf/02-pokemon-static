import type { FavoritePokemon } from 'interfaces/favorite-pokemon'
import { speak } from 'scripts/sounds'
import type { Component } from 'solid-js'
import SvgIcon from '@components/shared/SvgIcon'
import checkIcon from '../../icons/check.svg?raw'
import trashIcon from '../../icons/trash.svg?raw'
import xIcon from '../../icons/x.svg?raw'

interface Props {
  pokemon: FavoritePokemon
  spanishName: string
  spokenName: string
  imageSrc: string
  onDelete: () => void
}

const FavoritePokemonCard: Component<Props> = ({
  pokemon,
  spanishName,
  spokenName,
  imageSrc,
  onDelete
}) => {
  let dialog!: HTMLDialogElement

  // Ibai no lee: la pregunta también se dice
  const askDelete = () => {
    dialog.returnValue = ''
    dialog.showModal()
    speak(`¿Borrar a ${spokenName}?`)
  }

  return (
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
        aria-label='Borrar'
        class='grid place-items-center w-full mt-4 py-1 rounded-xl bg-red-700 text-white transition-transform active:scale-95'
      >
        <SvgIcon
          svg={trashIcon}
          class='[&>svg]:size-8'
        />
      </button>
      {/* form method=dialog cierra el diálogo y deja el botón pulsado en returnValue */}
      <dialog
        ref={dialog}
        onClose={() => dialog.returnValue === 'yes' && onDelete()}
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
              aria-label='No'
              class='btn-big bg-slate-600'
            >
              <SvgIcon
                svg={xIcon}
                class='[&>svg]:size-10'
              />
            </button>
            <button
              value='yes'
              aria-label='Sí'
              class='btn-big bg-red-700'
            >
              <SvgIcon
                svg={checkIcon}
                class='[&>svg]:size-10'
              />
            </button>
          </div>
        </form>
      </dialog>
    </article>
  )
}

export default FavoritePokemonCard
