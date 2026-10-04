import type { GamePokemon } from 'interfaces/game-pokemon'
import { animationsEnd } from 'scripts/animations'
import { createDeck, pickSome, shuffle } from 'scripts/random'
import { canSpeak, playSound, speak } from 'scripts/sounds'

// Buscar el Pokémon que pide la voz entre las casillas [data-option] de
// #find: ¿Dónde está…? (3, a la vista) y Escondite en la cueva (9, a
// oscuras). Basta con importarlo en la página; como módulo, se ejecuta una
// sola vez aunque lo importen las dos

type State = 'asking' | 'found'

const handleFind = () => {
  const find = document.getElementById('find') as HTMLDivElement

  if (!find) return

  const options = [...find.querySelectorAll<HTMLButtonElement>('[data-option]')]
  const cry = document.getElementById('find-cry') as HTMLAudioElement
  const btnAsk = document.getElementById('find-ask') as HTMLButtonElement
  const btnNext = document.getElementById('find-next') as HTMLButtonElement

  const pokemons: GamePokemon[] = JSON.parse(find.dataset.pokemons ?? '[]')
  // El que se pide no se repite hasta que han salido todos; los otros,
  // cualquiera
  const drawTarget = createDeck(pokemons)
  let target: GamePokemon | undefined
  let shown: GamePokemon[] = []
  // Cada pregunta es otra ronda: lo que quedara de la anterior se descarta
  let round = 0

  const getState = () => find.dataset.state as State
  const setState = (state: State) => {
    find.dataset.state = state
  }

  const ask = () => {
    if (target) speak(`¿Dónde está ${target.spokenName}?`)
  }

  const sayFound = ({ spokenName }: GamePokemon) => {
    speechSynthesis.cancel()
    cry.onended = () => speak(`¡Muy bien! ¡Es ${spokenName}!`)
    playSound(cry)
  }

  // El que se pide y otros, en un orden cualquiera
  const showPokemons = () => {
    round++
    cry.onended = null
    speechSynthesis.cancel()

    const current = drawTarget()
    target = current
    shown = shuffle([
      current,
      ...pickSome(
        pokemons.filter((pokemon) => pokemon !== current),
        options.length - 1
      )
    ])

    options.forEach((option, index) => {
      const { name, image } = shown[index]
      const img = option.querySelector('img') as HTMLImageElement
      img.src = image
      img.alt = `Imagen de ${name}`
      option.setAttribute('aria-label', name)
      option.toggleAttribute('data-target', shown[index] === current)
      delete option.dataset.wrong
    })
    cry.src = current.cry
    setState('asking')
  }

  const choose = async (option: HTMLButtonElement, pokemon: GamePokemon) => {
    if (!target) return

    // Ya encontrado: tocarlo otra vez lo vuelve a decir
    if (getState() === 'found') {
      if (pokemon === target) sayFound(target)
      return
    }

    if (pokemon === target) {
      setState('found')
      sayFound(target)
      return
    }

    // Ese no es: niega, dice quién es y vuelve a preguntar. No se pierde
    if ('wrong' in option.dataset) return

    const thisRound = round
    option.dataset.wrong = ''
    speak(`Ese es ${pokemon.spokenName}. ¿Dónde está ${target.spokenName}?`)
    await animationsEnd(option)
    if (thisRound !== round) return

    delete option.dataset.wrong
  }

  options.forEach((option, index) =>
    option.addEventListener('click', () => choose(option, shown[index]))
  )
  btnAsk.addEventListener('click', ask)
  btnNext.addEventListener('click', () => {
    showPokemons()
    ask()
  })
  showPokemons()
  if (canSpeak()) ask()
}

document.addEventListener('astro:page-load', handleFind)
