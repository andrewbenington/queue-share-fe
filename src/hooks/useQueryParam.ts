import { useCallback, useEffect, useMemo } from 'react'
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

export function useStringQuery(
  queryName: string,
  defaultVal?: string
): [string, (newValue?: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = useMemo(() => {
    return searchParams.get(queryName) ?? defaultVal ?? ''
  }, [searchParams])

  const setValue = useCallback(
    (newValue?: string) => {
      if (!newValue) {
        searchParams.delete(queryName)
        setSearchParams(searchParams, { replace: true })
      } else {
        searchParams.set(queryName, newValue)
      }
      setSearchParams(searchParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    if (value && searchParams.get(queryName) !== value) {
      searchParams.set(queryName, value)
      setSearchParams(searchParams, { replace: true })
    }
  }, [value, searchParams])

  return [value, setValue]
}

export function usePersistentStringQuery(
  queryName: string,
  defaultVal?: string
): [string, (newValue?: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = useMemo(() => {
    return searchParams.get(queryName) ?? localStorage.getItem(queryName) ?? defaultVal ?? ''
  }, [searchParams])

  const setValue = useCallback(
    (newValue?: string) => {
      if (!newValue) {
        searchParams.delete(queryName)
        localStorage.removeItem(queryName)
        setSearchParams(searchParams, { replace: true })
      } else {
        searchParams.set(queryName, newValue)
        localStorage.setItem(queryName, newValue)
      }
      setSearchParams(searchParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    if (value && searchParams.get(queryName) !== value) {
      searchParams.set(queryName, value)
      localStorage.setItem(queryName, value)
      setSearchParams(searchParams, { replace: true })
    }
  }, [value, searchParams])

  return [value, setValue]
}

export function usePersistentIntQuery(
  queryName: string,
  defaultVal: number
): [number, (newValue?: string) => void] {
  const [searchParams, setSearchParams] = useSearchParams()
  const value = useMemo(() => {
    const stringVal = searchParams.get(queryName) ?? localStorage.getItem(queryName)
    if (stringVal !== null) {
      return parseInt(stringVal)
    }
    return defaultVal
  }, [searchParams])

  const setValue = useCallback(
    (newValue?: string) => {
      searchParams.set(queryName, newValue ?? '')
      localStorage.setItem(queryName, newValue ?? '')
      setSearchParams(searchParams, { replace: true })
    },
    [searchParams, setSearchParams]
  )

  useEffect(() => {
    if (!value) {
      setValue(defaultVal.toString())
    }
  }, [])

  // useEffect(() => {
  //   const stringVal = searchParams.get(queryName)
  //   if (!stringVal) {
  //     searchParams.delete(queryName)
  //     localStorage.removeItem(queryName)
  //     return
  //   }

  //   const numberVal = parseInt(stringVal)
  //   if (value && numberVal !== value) {
  //     searchParams.set(queryName, numberVal.toString())
  //     localStorage.setItem(queryName, numberVal.toString())
  //     setSearchParams(searchParams, { replace: true })
  //   }
  // }, [value, searchParams])

  return [value, setValue]
}
