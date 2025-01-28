import dayjs, { Dayjs } from 'dayjs'
import { ArtistData, TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import { DoRequestWithToken, ErrorResponse } from '../../util/requests'
import { FriendStatsByURI, MinEntryResponse, MonthRankingResponse } from '../stats'
import { UserData } from '../user'
import { TrackRankingResponse } from './tracks'

export type ArtistRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank: number
  rank_change?: number
  artist: ArtistData
  tracks: string[]
}

type ArtistRankingResponse = Omit<ArtistRanking, 'artist'>

export type ArtistRankings = {
  rankings: ArtistRanking[]
  timeframe: string
  startDate: Dayjs
}

export type TimeframeArtistRankingResponse = Omit<ArtistRankings, 'artists' | 'startDate'> & {
  artists?: ArtistRankingResponse[]
  start_date_unix_seconds: number
}

type ArtistsByTimeframeResponse = {
  rankings: TimeframeArtistRankingResponse[]
  artist_data: { [artist_id: string]: ArtistData }
}

export async function GetArtistsByTimeframe(
  token: string,
  timeframe: string,
  max: number,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  friendID?: string,
  artist_uris?: string[],
  album_uri?: string
): Promise<ArtistRankings[] | ErrorResponse> {
  const response = await DoRequestWithToken<ArtistsByTimeframeResponse>(
    `/rankings/artist`,
    'GET',
    token,
    {
      query: {
        friend_id: friendID,
        timeframe,
        max,
        album_uri,
        artist_uris: artist_uris?.join(','),
        start_unix: start?.unix(),
        end_unix: end?.unix(),
      },
    }
  )

  if ('error' in response) return response

  const populatedMonthRankings: ArtistRankings[] = []
  response.rankings.forEach((timeframeRanking) => {
    const populatedArtistRankings: ArtistRanking[] = []
    timeframeRanking.artists?.forEach((artistRanking) => {
      const artistData = response.artist_data[artistRanking.spotify_id]
      populatedArtistRankings.push({ ...artistRanking, artist: artistData })
    })
    populatedMonthRankings.push({
      ...timeframeRanking,
      rankings: populatedArtistRankings,
      startDate: dayjs.unix(timeframeRanking.start_date_unix_seconds).tz('UTC'),
    })
  })

  return populatedMonthRankings
}

type ArtistStatsResponse = {
  artist: ArtistData
  streams?: MinEntryResponse[]
  tracks: { [id: string]: TrackData }
  track_ranks: { [id: string]: TrackRankingResponse }
}

export type ArtistStats = {
  artist: ArtistData
  streams: MinEntry[]
  tracks: { [id: string]: TrackData }
  track_ranks: { [id: string]: TrackRankingResponse }
}

export async function GetArtistStats(
  token: string,
  uri: string,
  friendID?: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs()
): Promise<ErrorResponse | ArtistStats> {
  const response = await DoRequestWithToken<ArtistStatsResponse>(`/stats/artist`, 'GET', token, {
    query: {
      friend_id: friendID,
      spotify_uri: uri,
      start_unix: start.unix(),
      end_unix: end.unix(),
    },
  })

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
  const response = await DoRequestWithToken<MonthRankingResponse[]>(
    `/rankings/artist/${uri}`,
    'GET',
    token,
    {
      query: { friend_id: friendID, timeframe },
    }
  )

  if ('error' in response) return response

  return response.map((ranking) => ({
    ...ranking,
    timestamp: dayjs.unix(ranking.start_date_unix_seconds),
  }))
}

export type FriendArtistComparison = {
  streams_by_uri: FriendStatsByURI
  ranks_by_uri: FriendStatsByURI
  artist_data: { [track_id: string]: ArtistData }
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

export async function CompareFriendArtistStats(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  sharedOnly: boolean = false,
  max = 100
) {
  return DoRequestWithToken<FriendArtistComparison>(`/stats/compare-artists`, 'GET', token, {
    query: {
      start: start?.unix(),
      end: end?.unix(),
      shared_only: sharedOnly,
      max,
    },
  })
}
