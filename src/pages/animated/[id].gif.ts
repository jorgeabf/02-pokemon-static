import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro'
import { getCopiedFilePaths, getRemoteAnimatedUrl } from 'services/pokemon-images'

export const getStaticPaths = (() =>
  getCopiedFilePaths(getRemoteAnimatedUrl)) satisfies GetStaticPaths

type Props = InferGetStaticPropsType<typeof getStaticPaths>

// El GIF animado de cada Pokémon, copiado tal cual al compilar: pasarlo a
// WebP solo ahorra un 10 % y emborrona el pixel art
export const GET: APIRoute<Props> = ({ props }) => new Response(props.file)
