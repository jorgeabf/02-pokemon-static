// De 10 en 10 reutiliza conexiones: es más rápido y estable que todas a la vez
const BATCH_SIZE = 10

// read dice cómo leer cada respuesta (JSON, bytes…)
export const fetchInBatches = async <T>(
  urls: string[],
  read: (resp: Response) => Promise<T>
) => {
  const results: T[] = []

  for (let i = 0; i < urls.length; i += BATCH_SIZE) {
    const batch = urls.slice(i, i + BATCH_SIZE)
    results.push(...(await Promise.all(batch.map(async (url) => read(await fetch(url))))))
  }

  return results
}
