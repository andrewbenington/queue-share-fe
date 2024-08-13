import dayjs, { Dayjs } from 'dayjs'
import { TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import {
  DoRequestWithRoomCredentials,
  DoRequestWithToken,
  ErrorResponse,
} from '../../util/requests'
import { RoomCredentials } from '../auth'
import { FriendStatsByURI, MinEntryResponse, MonthRankingResponse } from '../stats'
import { UserData } from '../user'

export async function SearchTracksFromRoom(
  roomCode: string,
  roomCredentials: RoomCredentials,
  term: string
) {
  return DoRequestWithRoomCredentials<TrackData[]>(
    `/room/${roomCode}/search`,
    'GET',
    roomCredentials,
    { query: { q: term } }
  )
}

export async function SearchTracks(token: string, term: string) {
  return DoRequestWithToken<TrackData[]>(`/spotify/search-tracks`, 'GET', token, {
    query: { q: term },
  })
}

export async function GetTracksByURIs(token: string, uris: string[]) {
  return DoRequestWithToken<{ [id: string]: TrackData }>(`/spotify/tracks-by-uri`, 'GET', token, {
    query: { uris: uris.join(',') },
  })
}

export async function SuggestedTracks(roomCode: string, roomCredentials: RoomCredentials) {
  return DoRequestWithRoomCredentials<TrackData[]>(
    `/room/${roomCode}/suggested`,
    'GET',
    roomCredentials
  )
}

type TrackStatsResponse = {
  track: TrackData
  streams?: MinEntryResponse[]
}

export type TrackStats = {
  track: TrackData
  streams: MinEntry[]
}

export async function GetTrackStats(token: string, uri: string, friendID?: string) {
  const response = await DoRequestWithToken<TrackStatsResponse>(
    `/stats/track?spotify_uri=${uri}${friendID ? `&friend_id=${friendID}` : ''}`,
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

export type TrackRanking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank: number
  rank_change?: number
  track: TrackData
}

export type TrackRankingResponse = Omit<TrackRanking, 'track'>

export type TrackRankings = {
  rankings: TrackRanking[]
  timeframe: string
  startDate: Dayjs
}

export async function GetTrackRankings(
  token: string,
  uri: string,
  timeframe: string,
  friendID?: string
) {
  const response = await DoRequestWithToken<MonthRankingResponse[]>(
    `/rankings/track/${uri}`,
    'GET',
    token,
    {
      query: {
        friend_id: friendID,
        timeframe,
        spotify_uri: uri,
      },
    }
  )

  if ('error' in response) return response

  return response.map((ranking) => ({
    ...ranking,
    timestamp: dayjs.unix(ranking.start_date_unix_seconds),
  }))
}

export type TimeframeTrackRankingResponse = Omit<TrackRankings, 'tracks' | 'startDate'> & {
  tracks?: TrackRankingResponse[]
  start_date_unix_seconds: number
}

export type TracksByTimeframeResponse = {
  rankings: TimeframeTrackRankingResponse[]
  track_data: { [track_id: string]: TrackData }
}

export async function GetTracksByTimeframe(
  token: string,
  timeframe: string,
  max: number,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  friendID?: string,
  artist_uris?: string[],
  album_uri?: string
): Promise<TrackRankings[] | ErrorResponse> {
  const response = await DoRequestWithToken<TracksByTimeframeResponse>(
    `/rankings/track`,
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

  const populatedMonthRankings: TrackRankings[] = []
  response.rankings.forEach((timeframeRanking) => {
    const populatedTrackRankings: TrackRanking[] = []
    timeframeRanking.tracks?.forEach((trackRanking) => {
      const trackData = response.track_data[trackRanking.spotify_id]
      populatedTrackRankings.push({ ...trackRanking, track: trackData })
    })
    populatedMonthRankings.push({
      ...timeframeRanking,
      rankings: populatedTrackRankings,
      startDate: dayjs.unix(timeframeRanking.start_date_unix_seconds).tz('UTC'),
    })
  })

  return populatedMonthRankings
}

export type FriendTrackComparison = {
  streams_by_uri: FriendStatsByURI
  ranks_by_uri: FriendStatsByURI
  track_data: { [track_id: string]: TrackData }
  friend_data: { [track_id: string]: UserData }
}

export async function CompareFriendTrackStats(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  sharedOnly: boolean = false,
  max = 100
) {
  return DoRequestWithToken<FriendTrackComparison>(`/stats/compare-tracks`, 'GET', token, {
    query: {
      start_unix: start?.unix(),
      end_unix: end?.unix(),
      shared_only: sharedOnly,
      max,
    },
  })
}
