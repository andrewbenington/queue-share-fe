import dayjs from 'dayjs'
import { Artist } from 'spotify-types'
import { MinEntry } from '../../types/stats'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { MinEntryResponse, MonthRanking } from '../stats'

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
}

export type MonthlyArtistRankingResponse = Omit<MonthlyArtistRanking, 'artists'> & {
  artists: ArtistRankingResponse[]
}

type ArtistsByMonthResponse = {
  rankings: MonthlyArtistRankingResponse[]
  artist_data: { [artist_id: string]: Artist }
}

export async function GetArtistsByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
): Promise<MonthlyArtistRanking[] | ErrorResponse> {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  const response = await DoRequestWithToken<ArtistsByMonthResponse>(
    `/stats/artists-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    'GET',
    token
  )

  if ('error' in response) return response

  const populatedMonthRankings: MonthlyArtistRanking[] = []
  response.rankings.forEach((monthlyRanking) => {
    const populatedArtistRankings: ArtistRanking[] = []
    monthlyRanking.artists.forEach((trackRanking) => {
      const artistData = response.artist_data[trackRanking.spotify_id]
      populatedArtistRankings.push({ ...trackRanking, artist: artistData })
    })
    populatedMonthRankings.push({
      ...monthlyRanking,
      artists: populatedArtistRankings,
    })
  })

  return populatedMonthRankings
}

type ArtistStatsResponse = {
  artist: Artist
  streams?: MinEntryResponse[]
}

export type ArtistStats = {
  artist: Artist
  streams: MinEntry[]
}

export async function GetArtistStats(token: string, uri: string) {
  const response = await DoRequestWithToken<ArtistStatsResponse>(
    `/stats/artist?spotify_uri=${uri}`,
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

export async function GetArtistRankings(token: string, uri: string) {
  return DoRequestWithToken<MonthRanking[]>(`/rankings/artist?spotify_uri=${uri}`, 'GET', token)
}
