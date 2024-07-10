import dayjs, { Dayjs } from 'dayjs'
import { MinEntry } from '../types/stats'
import { DoRequest, DoRequestWithToken, ErrorResponse } from '../util/requests'

export type MonthRanking = {
  position: number
  timestamp: Dayjs
  timeframe: string
}

export type MonthRankingResponse = Omit<MonthRanking, 'timestamp'> & {
  start_date_unix_seconds: number
}

export type MinEntryResponse = Omit<MinEntry, 'timestamp'> & {
  timestamp: number
}

export async function UploadHistory(token: string, file: Blob) {
  const requestOptions = {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + token,
      'Access-Control-Allow-Origin': '*',
    },
    body: file,
  }
  try {
    return await DoRequest<null>(`/stats/upload`, requestOptions)
  } catch (e) {
    return { error: JSON.stringify(e) }
  }
}

type HistoryResponse = {
  history: MinEntryResponse[]
  last_fetched?: string
}

type History = {
  history: MinEntry[]
  last_fetched?: Dayjs
}

export async function GetAllHistory(
  token: string,
  friendID?: string
): Promise<History | ErrorResponse> {
  const response = await DoRequestWithToken<HistoryResponse>(
    `/stats/history${friendID ? `?friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
  if ('error' in response) return response
  return {
    history: response.history.map((entry) => ({
      ...entry,
      timestamp: dayjs(entry.timestamp),
    })),
    last_fetched: response.last_fetched ? dayjs(response.last_fetched) : undefined,
  }
}

type UserHistoryStatusResponse = {
  user_has_history: boolean
}

export async function GetUserHistoryStatus(token: string) {
  return DoRequestWithToken<UserHistoryStatusResponse>(`/user/has-spotify-history`, 'GET', token)
}

export type FriendStatsByURI = {
  [uri: string]: { [friendID: string]: number }
}
