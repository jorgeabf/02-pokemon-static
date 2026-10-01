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
