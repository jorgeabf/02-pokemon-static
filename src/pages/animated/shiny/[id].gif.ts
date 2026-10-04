import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro'
import { getCopiedFilePaths, getRemoteShinyAnimatedUrl } from 'services/pokemon-images'

export const getStaticPaths = (() =>
  getCopiedFilePaths(getRemoteShinyAnimatedUrl)) satisfies GetStaticPaths

type Props = InferGetStaticPropsType<typeof getStaticPaths>

// El GIF animado brillante de cada Pokémon, copiado tal cual al compilar como
// el normal (../[id].gif.ts): «Brillante» funciona sin conexión
export const GET: APIRoute<Props> = ({ props }) => new Response(props.file)
