import dayjs, { Dayjs } from 'dayjs'
import { AlbumData, TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { FriendStatsByURI, MinEntryResponse, MonthRanking, MonthRankingResponse } from '../stats'
import { UserData } from '../user'

export type AlbumRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank: number
  rank_change?: number
  album: AlbumData
  tracks: string[]
}

type AlbumRankingResponse = Omit<AlbumRanking, 'album'>
export type AlbumRankings = {
  rankings: AlbumRanking[]
  timeframe: string
  startDate: Dayjs
}

export type TimeframeAlbumRankingResponse = Omit<AlbumRankings, 'artists' | 'startDate'> & {
  albums?: AlbumRankingResponse[]
  start_date_unix_seconds: number
}

type AlbumsByTimeframeResponse = {
  rankings: TimeframeAlbumRankingResponse[]
  album_data: { [album_id: string]: AlbumData }
  tracks: { [id: string]: TrackData }
}

export async function GetAlbumsByTimeframe(
  token: string,
  timeframe: string,
  max: number,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  friendID?: string,
  artist_uris?: string[],
  album_uri?: string
): Promise<AlbumRankings[] | ErrorResponse> {
  const response = await DoRequestWithToken<AlbumsByTimeframeResponse>(
    `/rankings/album`,
    'GET',
    token,
    {
      query: {
        friend_id: friendID,
        timeframe,
        max,
        album_uri,
        artist_uri: artist_uris ? artist_uris[0] : undefined,
        start_unix: start?.unix(),
        end_unix: end?.unix(),
      },
    }
  )

  if ('error' in response) return response

  const populatedMonthRankings: AlbumRankings[] = []
  response.rankings.forEach((timeframeRanking) => {
    const populatedAlbumRankings: AlbumRanking[] = []
    timeframeRanking.albums?.forEach((albumRanking) => {
      const albumData = response.album_data[albumRanking.spotify_id]
      populatedAlbumRankings.push({ ...albumRanking, album: albumData })
    })
    populatedMonthRankings.push({
      ...timeframeRanking,
      rankings: populatedAlbumRankings,
      startDate: dayjs.unix(timeframeRanking.start_date_unix_seconds).tz('UTC'),
    })
  })

  return populatedMonthRankings
}

export async function GetAlbumRankings(token: string, uri: string, friendID?: string) {
  const response = await DoRequestWithToken<MonthRankingResponse[]>(
    `/rankings/album/${uri}`,
    'GET',
    token,
    { query: { friend_id: friendID, timeframe: 'month' } }
  )

  if ('error' in response) return response

  return response.map((ranking) => ({
    ...ranking,
    timestamp: dayjs.unix(ranking.start_date_unix_seconds),
  }))
}
export type AlbumStatsResponse = {
  album: AlbumData
  streams?: MinEntryResponse[]
  rankings: MonthRanking[]
  tracks: { [id: string]: TrackData }
}

export type AlbumStats = {
  album: AlbumData
  streams: MinEntry[]
  rankings: MonthRanking[]
  tracks: { [id: string]: TrackData }
}
export async function GetAlbumStats(token: string, uri: string, friendID?: string) {
  const response = await DoRequestWithToken<AlbumStatsResponse>(`/stats/album`, 'GET', token, {
    query: {
      friend_id: friendID,
      spotify_uri: uri,
    },
  })

  if ('error' in response) return response
  const streamsWithTimestamps = response.streams?.map((entry) => ({
    ...entry,
    timestamp: dayjs(entry.timestamp),
  }))

  return { ...response, streams: streamsWithTimestamps ?? [] }
}

export type FriendAlbumComparison = {
  streams_by_uri: FriendStatsByURI
  ranks_by_uri: FriendStatsByURI
  album_data: { [album_id: string]: AlbumData }
  friend_data: { [track_id: string]: UserData }
  friend_streams: {
    [user_id: string]: {
      spotify_id: string
      stream_count: number
      rank: number
      tracks: string[]
    }[]
  }
}

export async function CompareFriendAlbumStats(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  sharedOnly: boolean = false,
  max = 100
) {
  return DoRequestWithToken<FriendAlbumComparison>(`/stats/compare-albums`, 'GET', token, {
    query: {
      start: start?.unix(),
      end: end?.unix(),
      shared_only: sharedOnly,
      max,
    },
  })
}
