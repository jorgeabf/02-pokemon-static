import { createSignal, type Component, type JSX } from 'solid-js'

interface Props {
  initialValue: number
  children: JSX.Element
}

const Counter: Component<Props> = ({ initialValue, children }) => {
  const [counter, setCounter] = createSignal(initialValue)

  const handleDecrement = () => setCounter(counter() - 1)
  const handleIncrement = () => setCounter(counter() + 1)

  return (
    <aside class='mx-auto w-fit text-center p-8 border border-slate-400 rounded-xl grid gap-4'>
      {children}
      <div class='flex justify-center gap-2'>
        <button
          class='size-16 bg-red-700 rounded-xl font-black'
          onClick={handleDecrement}
        >
          -
        </button>
        <button
          class='size-16 bg-green-700 rounded-xl font-black'
          onClick={handleIncrement}
        >
          +
        </button>
      </div>
      <h3 class='text-xl font-semibold'>Valor: {counter()}</h3>
    </aside>
  )
}

export default Counter
