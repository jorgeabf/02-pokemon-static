import type { APIRoute, GetStaticPaths, InferGetStaticPropsType } from 'astro'
import { getCopiedFilePaths, getRemoteCryUrl } from 'services/pokemon-images'

export const getStaticPaths = (() =>
  getCopiedFilePaths(getRemoteCryUrl)) satisfies GetStaticPaths

type Props = InferGetStaticPropsType<typeof getStaticPaths>

// El grito de cada Pokémon, copiado de PokeAPI al compilar
export const GET: APIRoute<Props> = ({ props }) => new Response(props.file)
