import dayjs, { Dayjs } from 'dayjs'
import { Artist } from 'spotify-types'
import { ArtistData, TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { FriendStatsByURI, MinEntryResponse, MonthRanking, StreamsByYear } from '../stats'
import { UserData } from '../user'

export type ArtistRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank_change?: number
  artist: Artist
  tracks: string[]
}

type ArtistRankingResponse = Omit<ArtistRanking, 'artist'>

export type MonthlyArtistRanking = {
  year: number
  month: number
  artists: ArtistRanking[]
  timeframe: string
  startDate: Dayjs
}

export type MonthlyArtistRankingResponse = Omit<MonthlyArtistRanking, 'artists' | 'startDate'> & {
  artists?: ArtistRankingResponse[]
  start_date_unix_seconds: number
}

type ArtistsByMonthResponse = {
  rankings: MonthlyArtistRankingResponse[]
  artist_data: { [artist_id: string]: Artist }
}

export async function GetArtistsByTimeframe(
  token: string,
  timeframe: string,
  max: number,
  friendID?: string
): Promise<MonthlyArtistRanking[] | ErrorResponse> {
  const response = await DoRequestWithToken<ArtistsByMonthResponse>(
    `/stats/artists-by-month?timeframe=${timeframe}&max=${max}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )

  if ('error' in response) return response

  const populatedMonthRankings: MonthlyArtistRanking[] = []
  response.rankings.forEach((monthlyRanking) => {
    const populatedArtistRankings: ArtistRanking[] = []
    monthlyRanking.artists?.forEach((trackRanking) => {
      const artistData = response.artist_data[trackRanking.spotify_id]
      populatedArtistRankings.push({ ...trackRanking, artist: artistData })
    })
    populatedMonthRankings.push({
      ...monthlyRanking,
      artists: populatedArtistRankings,
      startDate: dayjs.unix(monthlyRanking.start_date_unix_seconds),
    })
  })

  return populatedMonthRankings
}

type ArtistStatsResponse = {
  artist: Artist
  streams?: MinEntryResponse[]
  tracks: { [id: string]: TrackData }
}

export type ArtistStats = {
  artist: Artist
  streams: MinEntry[]
  tracks: { [id: string]: TrackData }
}

export async function GetArtistStats(
  token: string,
  uri: string,
  friendID?: string
): Promise<ErrorResponse | ArtistStats> {
  const response = await DoRequestWithToken<ArtistStatsResponse>(
    `/stats/artist?spotify_uri=${uri}${friendID ? `&friend_id=${friendID}` : ''}`,
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

export async function GetArtistRankings(
  token: string,
  uri: string,
  timeframe: string,
  friendID?: string
) {
  return DoRequestWithToken<MonthRanking[]>(
    `/rankings/artist?spotify_uri=${uri}&timeframe=${timeframe}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
}
export async function GetArtistsByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  friendID?: string
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/artists-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
}

export type FriendArtistComparison = {
  streams_by_uri: FriendStatsByURI
  ranks_by_uri: FriendStatsByURI
  artist_data: { [track_id: string]: ArtistData }
  friend_data: { [track_id: string]: UserData }
}

export async function CompareFriendArtistStats(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs()
) {
  return DoRequestWithToken<FriendArtistComparison>(
    `/stats/compare-artists`,
    'GET',
    token,
    undefined,
    undefined,
    undefined,
    { start: start?.unix(), end: end?.unix() }
  )
}
