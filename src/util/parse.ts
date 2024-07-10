import dayjs, { Dayjs } from 'dayjs'

export function parseFloatIfDefined(val?: string) {
  if (val === undefined || val === '') return undefined
  return parseFloat(val)
}

export function parseIntIfDefined(val?: string) {
  if (val === undefined || val === '') return undefined
  return parseInt(val)
}

export function undefinedIfEmpty(val?: string) {
  if (val === undefined || val === '') return undefined
  return val
}
const isoRE =
  /(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d([+-][0-2]\d:[0-5]\d|Z))/

export function jsonDateReviver(_: string, value: string) {
  if (isoRE.test(value)) {
    return dayjs(value)
  }
  return value
}

export function jsonDateReplacer(_: string, value: object) {
  if (value instanceof dayjs) {
    return dayjs.tz(value as Dayjs, 'America/Chicago').toISOString()
  }
  return value
}

export function parseUTCDate(value: string) {
  return dayjs.tz(value, 'UTC')
}

export function resourceTypeFromARN(arn?: string) {
  if (!arn) return undefined
  const segments = arn.split(':')
  if (segments.length < 3) return undefined
  return segments[2]
}
