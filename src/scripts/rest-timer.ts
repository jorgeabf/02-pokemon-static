import { pickSome } from 'scripts/random'
import { canSpeak, speak } from 'scripts/sounds'

// «Hora de descansar»: el adulto pone un tiempo y, al acabar, Snorlax se
// duerme y no deja jugar hasta que el adulto lo quita. La hora se guarda en
// el móvil: cerrar y abrir la app no lo quita. El HTML está en
// components/shared/RestTimer.astro

// A qué hora (ms) se duerme Snorlax
const TIMER_KEY = 'restEndsAt'
// Fallos seguidos con la palabra y hasta cuándo hay que esperar
const GATE_KEY = 'restGate'

// La voz avisa un minuto antes de que se duerma
const WARNING_MS = 60_000

const HOLD_MS = 2000
// Tras un fallo, 10 s; con cada fallo seguido, el doble, hasta 5 minutos.
// Tocando al azar se acierta 1 de cada 4: con una espera fija, Ibai daría
// con ella en menos de un minuto
const FIRST_WAIT_MS = 10_000
const MAX_WAIT_MS = 5 * 60_000

// Cortas y distintas, para que el adulto las lea de un vistazo
const WORDS = [
  'SOL',
  'GATO',
  'MESA',
  'LUNA',
  'PATO',
  'TREN',
  'CASA',
  'FLOR',
  'NUBE',
  'BARCO',
  'PERRO',
  'LIBRO'
]

// Para qué se abre la palabra: poner el tiempo o despertar a Snorlax
type Purpose = 'panel' | 'unlock'
type Gate = { fails: number; until: number }

const getEndsAt = () => Number(localStorage.getItem(TIMER_KEY)) || undefined

const isAsleep = () => {
  const endsAt = getEndsAt()
  return endsAt !== undefined && endsAt <= Date.now()
}

const getGate = (): Gate =>
  JSON.parse(localStorage.getItem(GATE_KEY) ?? '{"fails":0,"until":0}')

// Cada página trae los suyos (el ClientRouter cambia el body): se buscan
// cada vez
const lockDialog = () => document.getElementById('rest-lock') as HTMLDialogElement | null
const adultDialog = () => document.getElementById('rest-adult') as HTMLDialogElement | null

// Snorlax se duerme
let sleepTimeout: number | undefined

const fallAsleep = () => {
  const lock = lockDialog()

  if (!lock || lock.open) return

  lock.showModal()
  if (canSpeak()) speak('¡A descansar! Snorlax se ha dormido')
}

// El aviso, una vez por cada tiempo que se pone (endsAt), aunque se cambie de
// página. Si aún no se puede hablar (la app recién abierta, sin tocar), se
// queda para la siguiente vez que se mire, al navegar o volver a la app
let warningTimeout: number | undefined
let warnedFor: number | undefined

const warn = (endsAt: number) => {
  if (warnedFor === endsAt || !canSpeak()) return

  warnedFor = endsAt
  speak('¡Snorlax tiene sueño! En un minuto se dormirá')
}

// Al cargar cada página, al volver a la app y al cambiar el tiempo
const schedule = () => {
  clearTimeout(sleepTimeout)
  clearTimeout(warningTimeout)

  const endsAt = getEndsAt()

  if (endsAt === undefined) return

  const now = Date.now()

  if (endsAt <= now) {
    fallAsleep()
    return
  }

  sleepTimeout = window.setTimeout(fallAsleep, endsAt - now)

  // Ya en el último minuto (al volver a la app, por ejemplo): ahora
  const warnAt = endsAt - WARNING_MS
  if (warnAt <= now) warn(endsAt)
  else warningTimeout = window.setTimeout(() => warn(endsAt), warnAt - now)
}

const clearTimer = () => {
  localStorage.removeItem(TIMER_KEY)
  clearTimeout(sleepTimeout)
  clearTimeout(warningTimeout)
}

// El adulto: primero la palabra y, si acierta, lo que venía a hacer
let purpose: Purpose = 'panel'
let target = ''
let waitInterval: number | undefined

// Si hay que esperar por un fallo, los botones se apagan y se ve la cuenta
// atrás. Sigue al cerrar y abrir: está guardada
const showWait = (dialog: HTMLDialogElement) => {
  const buttons = dialog.querySelectorAll<HTMLButtonElement>('[data-word]')
  const wait = dialog.querySelector('#rest-wait') as HTMLElement

  const update = () => {
    const seconds = Math.ceil((getGate().until - Date.now()) / 1000)
    const waiting = seconds > 0

    buttons.forEach((button) => {
      button.disabled = waiting
    })
    wait.textContent = waiting ? `Espera ${seconds} s` : ''
    if (!waiting) clearInterval(waitInterval)
  }

  clearInterval(waitInterval)
  update()
  waitInterval = window.setInterval(update, 1000)
}

// Cuatro palabras al azar y una de ellas, la que hay que tocar
const showChallenge = (dialog: HTMLDialogElement) => {
  const words = pickSome(WORDS, 4)
  target = words[Math.floor(Math.random() * words.length)]

  const word = dialog.querySelector('#rest-word') as HTMLElement
  word.textContent = target
  dialog.querySelectorAll<HTMLButtonElement>('[data-word]').forEach((button, index) => {
    button.textContent = words[index]
    button.dataset.word = words[index]
  })
  showWait(dialog)
}

const showPanel = (dialog: HTMLDialogElement) => {
  const status = dialog.querySelector('#rest-status') as HTMLElement
  const btnClear = dialog.querySelector('#rest-clear') as HTMLButtonElement
  const endsAt = getEndsAt()

  dialog.dataset.step = 'panel'
  btnClear.hidden = endsAt === undefined

  if (endsAt === undefined) {
    status.textContent = 'Sin temporizador: elige cuánto puede jugar.'
    return
  }

  const time = new Date(endsAt).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const minutes = Math.ceil((endsAt - Date.now()) / 60_000)
  status.textContent = `Snorlax se dormirá a las ${time} (quedan ${minutes} min).`
}

const openAdult = (why: Purpose) => {
  const dialog = adultDialog()

  if (!dialog || dialog.open) return

  purpose = why
  dialog.dataset.step = 'gate'
  showChallenge(dialog)
  dialog.showModal()
}

const answer = (dialog: HTMLDialogElement, word: string) => {
  if (word !== target) {
    const { fails } = getGate()
    const wait = Math.min(FIRST_WAIT_MS * 2 ** fails, MAX_WAIT_MS)

    localStorage.setItem(
      GATE_KEY,
      JSON.stringify({ fails: fails + 1, until: Date.now() + wait })
    )
    showChallenge(dialog)
    return
  }

  localStorage.removeItem(GATE_KEY)

  if (purpose === 'panel') {
    showPanel(dialog)
    return
  }

  // Se quita antes de cerrar a Snorlax: si no, se volvería a abrir
  clearTimer()
  dialog.close()
  lockDialog()?.close()
}

const choose = (dialog: HTMLDialogElement, minutes: number) => {
  localStorage.setItem(TIMER_KEY, String(Date.now() + minutes * 60_000))
  schedule()
  dialog.close()
  speak(minutes === 60 ? '¡Puedes jugar una hora!' : `¡Puedes jugar ${minutes} minutos!`)
}

document.addEventListener('click', (event) => {
  const dialog = adultDialog()
  const element = event.target as Element

  if (!dialog || !dialog.contains(element)) return

  const word = element.closest<HTMLButtonElement>('[data-word]')
  const minutes = element.closest<HTMLButtonElement>('[data-minutes]')

  if (word) answer(dialog, word.dataset.word ?? '')
  else if (minutes) choose(dialog, Number(minutes.dataset.minutes))
  else if (element.closest('#rest-clear')) {
    clearTimer()
    dialog.close()
  }
})

// Mantener pulsado 2 s un [data-parent-hold] (la Pokéball del menú, Snorlax
// dormido) abre la palabra del adulto
let holdTimeout: number | undefined
let held = false

document.addEventListener('pointerdown', (event) => {
  held = false
  clearTimeout(holdTimeout)

  const holder = (event.target as Element).closest<HTMLElement>('[data-parent-hold]')

  if (!holder) return

  holdTimeout = window.setTimeout(() => {
    held = true
    openAdult(holder.dataset.parentHold as Purpose)
  }, HOLD_MS)
})

const cancelHold = () => clearTimeout(holdTimeout)
document.addEventListener('pointerup', cancelHold)
document.addEventListener('pointercancel', cancelHold)

// El clic al soltar no navega, no habla ni cuenta como palabra si el dedo ha
// quedado encima del diálogo. En la captura, antes que nadie
document.addEventListener(
  'click',
  (event) => {
    if (!held) return

    held = false
    event.preventDefault()
    event.stopPropagation()
  },
  true
)

// Mientras duerma, ni Esc ni el «atrás» de Android quitan a Snorlax: el
// cierre se cancela y, si aun así se cierra, se vuelve a abrir. cancel y
// close no suben: se escuchan en la captura
document.addEventListener(
  'cancel',
  (event) => {
    if (event.target === lockDialog() && isAsleep()) event.preventDefault()
  },
  true
)
document.addEventListener(
  'close',
  (event) => {
    if (event.target === lockDialog() && isAsleep()) lockDialog()?.showModal()
  },
  true
)

document.addEventListener('astro:page-load', schedule)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') schedule()
})
