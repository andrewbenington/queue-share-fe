import { Album } from 'spotify-types'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { MonthRanking, StreamsByYear } from '../stats'

export async function GetAlbumsByYear(token: string, minSeconds?: number, excludeSkips?: boolean) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/albums-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
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
}

export async function GetAlbumsByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  artist_uri?: string
): Promise<MonthlyAlbumRanking[] | ErrorResponse> {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  const response = await DoRequestWithToken<AlbumsByMonthResponse>(
    `/stats/albums-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${
      artist_uri ? `&artist_uri=${artist_uri}` : ''
    }`,
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

export async function GetAlbumRankings(token: string, uri: string) {
  return DoRequestWithToken<MonthRanking[]>(`/rankings/album?spotify_uri=${uri}`, 'GET', token)
}
