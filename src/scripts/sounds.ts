export const playSound = (audio: HTMLAudioElement) => {
  audio.currentTime = 0
  audio.play()
}

export const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'es-ES'
  speechSynthesis.cancel()
  speechSynthesis.speak(utterance)
}

// El móvil no deja hablar hasta que se toca algo en la página. Al entrar en un
// juego desde /juegos/ ya se ha tocado (el ClientRouter no cambia de
// documento); al abrirlo directamente o al recargar, todavía no
export const canSpeak = () => navigator.userActivation.hasBeenActive
