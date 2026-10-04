import type { Component } from 'solid-js'

interface Props {
  // Un SVG de src/icons importado con ?raw
  svg: string
  // El tamaño va en el svg: [&>svg]:size-10
  class: string
}

// Los iconos de src/icons dentro de Solid, donde no llega astro-icon. El SVG
// se importa al compilar, así que innerHTML no mete nada de fuera. grid: sin
// el hueco de la línea de texto debajo del svg
const SvgIcon: Component<Props> = (props) => (
  <span
    aria-hidden='true'
    class={`grid ${props.class}`}
    innerHTML={props.svg}
  />
)

export default SvgIcon
