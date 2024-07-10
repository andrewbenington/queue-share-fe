import dayjs, { Dayjs } from 'dayjs'
import { Column } from 'react-data-grid'

export type SortableColumn<T> = Column<T> & {
  sortFunction?: (a: T, b: T) => number
}

export function stringSorter<T>(func: (val: T) => string | undefined) {
  return (a: T, b: T) => {
    const strA = func(a)
    const strB = func(b)
    if (!strA && !strB) return 0
    if (!strA) return Number.POSITIVE_INFINITY
    if (!strB) return Number.NEGATIVE_INFINITY
    return strA.localeCompare(strB)
  }
}

export function numericSorter<T>(func: (val: T) => number | undefined) {
  return (a: T, b: T) => {
    const numA = func(a) ?? Number.POSITIVE_INFINITY
    const numB = func(b) ?? Number.POSITIVE_INFINITY
    return numA - numB
  }
}

export function dayjsSorter<T>(func: (val: T) => Dayjs | undefined) {
  return (a: T, b: T) => {
    const dateA = func(a) ?? dayjs.unix(0)
    const dateB = func(b) ?? dayjs.unix(0)
    return dateA.diff(dateB)
  }
}

export function filterUndefined<T>(value: T | undefined): value is T {
  return value !== undefined
}
