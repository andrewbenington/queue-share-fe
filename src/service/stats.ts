import dayjs, { Dayjs } from 'dayjs'
import { TrackData } from '../types/spotify'
import { MinEntry, StreamCount } from '../types/stats'
import { DoRequest, DoRequestWithToken, ErrorResponse } from '../util/requests'

export type MonthRanking = {
  year: number
  month: number
  position: number
}

export type MinEntryResponse = Omit<MinEntry, 'timestamp'> & {
  timestamp: string
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

export type TrackRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank_change?: number
  track: TrackData
}

export type TrackRankingResponse = Omit<TrackRanking, 'track'>
export type MonthlyTrackRanking = {
  year: number
  month: number
  tracks: TrackRanking[]
}

export type StreamsByYear = {
  [year: number]: StreamCount[]
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
