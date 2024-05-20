import dayjs from 'dayjs'
import { Album } from 'spotify-types'
import { TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { MinEntryResponse, MonthRanking, StreamsByYear } from '../stats'

export async function GetAlbumsByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  friendID?: string
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/albums-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
}

export type AlbumRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank_change?: number
  album: Album
  tracks: string[]
}

type AlbumRankingResponse = Omit<AlbumRanking, 'album'>
export type MonthlyAlbumRanking = {
  year: number
  month: number
  albums: AlbumRanking[]
}

export type MonthlyAlbumRankingResponse = Omit<MonthlyAlbumRanking, 'albums'> & {
  albums: AlbumRankingResponse[]
}

type AlbumsByMonthResponse = {
  rankings: MonthlyAlbumRankingResponse[]
  album_data: { [album_id: string]: Album }
  tracks: { [id: string]: TrackData }
}

export async function GetAlbumsByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  artist_uri?: string,
  friendID?: string
): Promise<MonthlyAlbumRanking[] | ErrorResponse> {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  const response = await DoRequestWithToken<AlbumsByMonthResponse>(
    `/stats/albums-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${
      artist_uri ? `&artist_uri=${artist_uri}` : ''
    }${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )

  if ('error' in response) return response

  const populatedMonthRankings: MonthlyAlbumRanking[] = []
  response.rankings.forEach((monthlyRanking) => {
    const populatedAlbumRankings: AlbumRanking[] = []
    monthlyRanking.albums.forEach((trackRanking) => {
      const albumData = response.album_data[trackRanking.spotify_id]
      populatedAlbumRankings.push({ ...trackRanking, album: albumData })
    })
    populatedMonthRankings.push({
      ...monthlyRanking,
      albums: populatedAlbumRankings,
    })
  })

  return populatedMonthRankings
}

export async function GetAlbumRankings(token: string, uri: string, friendID?: string) {
  return DoRequestWithToken<MonthRanking[]>(
    `/rankings/album?spotify_uri=${uri}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
}
export type AlbumStatsResponse = {
  album: Album
  streams?: MinEntryResponse[]
  rankings: MonthRanking[]
  tracks: { [id: string]: TrackData }
}

export type AlbumStats = {
  album: Album
  streams: MinEntry[]
  rankings: MonthRanking[]
  tracks: { [id: string]: TrackData }
}
export async function GetAlbumStats(token: string, uri: string, friendID?: string) {
  const response = await DoRequestWithToken<AlbumStatsResponse>(
    `/stats/album?spotify_uri=${uri}${friendID ? `&friend_id=${friendID}` : ''}`,
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
