import { Dayjs } from 'dayjs'
import { TableData } from '../types/admin'
import { DoRequestWithToken } from '../util/requests'
import { UserData } from './user'

export async function GetTableData(token: string) {
  return DoRequestWithToken<TableData[]>(`/admin/tables`, 'GET', token)
}

export type LogEntry = {
  timestamp: Dayjs
  user: UserData
  endpoint: string
  friend?: UserData
}

export async function GetLogEntries(token: string, date: Dayjs) {
  return DoRequestWithToken<LogEntry[]>(`/admin/logs`, 'GET', token, {
    query: { date: date.format('MM-DD-YY') },
  })
}

export type TracksToProcessResponse = {
  missing_by_user: Record<string, number>
  users: Record<string, UserData>
}

export async function GetTracksToProcess(token: string) {
  return DoRequestWithToken<TracksToProcessResponse>(
    `/admin/missing-artist-uris-by-user`,
    'GET',
    token
  )
}
