import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export function useStringListQuery(
  queryName: string
): [string[] | undefined, (newValues?: string[]) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const values = useMemo(() => {
    return searchParams.get(queryName)?.split(',') ?? undefined
  }, [searchParams])

  const setValues = useCallback(
    (newValues?: string[]) => {
      if (newValues === undefined || newValues.length === 0) {
        searchParams.delete(queryName)
        setSearchParams(searchParams)
      } else {
        searchParams.set(queryName, newValues.join(','))
      }
      setSearchParams(searchParams)
    },
    [searchParams, setSearchParams]
  )

  return [values, setValues]
}
