import dayjs, { Dayjs } from 'dayjs'
import { Album } from 'spotify-types'
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

export async function GetAllHistory(token: string): Promise<History | ErrorResponse> {
  const response = await DoRequestWithToken<HistoryResponse>(`/stats/history`, 'GET', token)
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

type TrackRankingResponse = Omit<TrackRanking, 'track'>
export type MonthlyTrackRanking = {
  year: number
  month: number
  tracks: TrackRanking[]
}

export type MonthlyTrackRankingResponse = Omit<MonthlyTrackRanking, 'tracks'> & {
  tracks: TrackRankingResponse[]
}

type TracksByMonthResponse = {
  rankings: MonthlyTrackRankingResponse[]
  track_data: { [track_id: string]: TrackData }
}

export async function GetTracksByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  artist_uri?: string,
  album_uri?: string
): Promise<MonthlyTrackRanking[] | ErrorResponse> {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  const response = await DoRequestWithToken<TracksByMonthResponse>(
    `/stats/songs-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${
      artist_uri ? `&artist_uri=${artist_uri}` : ''
    }${album_uri ? `&album_uri=${album_uri}` : ''}`,
    'GET',
    token
  )

  if ('error' in response) return response

  const populatedMonthRankings: MonthlyTrackRanking[] = []
  response.rankings.forEach((monthlyRanking) => {
    const populatedTrackRankings: TrackRanking[] = []
    monthlyRanking.tracks.forEach((trackRanking) => {
      const trackData = response.track_data[trackRanking.spotify_id]
      populatedTrackRankings.push({ ...trackRanking, track: trackData })
    })
    populatedMonthRankings.push({
      ...monthlyRanking,
      tracks: populatedTrackRankings,
    })
  })

  return populatedMonthRankings
}

export type StreamsByYear = {
  [year: number]: StreamCount[]
}

export async function GetArtistsByYear(token: string, minSeconds?: number, excludeSkips?: boolean) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/artists-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    'GET',
    token
  )
}

export async function GetTracksByYear(token: string, minSeconds?: number, excludeSkips?: boolean) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/tracks-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    'GET',
    token
  )
}

type UserHistoryStatusResponse = {
  user_has_history: boolean
}

export async function GetUserHistoryStatus(token: string) {
  return DoRequestWithToken<UserHistoryStatusResponse>(`/user/has-spotify-history`, 'GET', token)
}

type AlbumStatsResponse = {
  album: Album
  streams?: MinEntryResponse[]
  rankings: MonthRanking[]
}

export type AlbumStats = {
  album: Album
  streams: MinEntry[]
  rankings: MonthRanking[]
}

export async function GetAlbumStats(token: string, uri: string) {
  const response = await DoRequestWithToken<AlbumStatsResponse>(
    `/stats/album?spotify_uri=${uri}`,
    'GET',
    token
  )

  if ('error' in response) return response
  const streamsWithTimestamps = response.streams?.map((entry) => ({
    ...entry,
    timestamp: dayjs(entry.timestamp),
  }))

  return { ...response, streams: streamsWithTimestamps ?? [] }
}
