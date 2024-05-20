import dayjs, { Dayjs } from 'dayjs'
import { TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import {
  DoRequestWithRoomCredentials,
  DoRequestWithToken,
  ErrorResponse,
} from '../../util/requests'
import { RoomCredentials } from '../auth'
import {
  FriendStatsByURI,
  MinEntryResponse,
  MonthRanking,
  MonthlyTrackRanking,
  StreamsByYear,
  TrackRanking,
  TrackRankingResponse,
} from '../stats'
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
    undefined,
    undefined,
    undefined,
    { q: term }
  )
}

export async function SearchTracks(token: string, term: string) {
  return DoRequestWithToken<TrackData[]>(
    `/spotify/search-tracks`,
    'GET',
    token,
    undefined,
    undefined,
    undefined,
    { q: term }
  )
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

export async function GetTrackRankings(token: string, uri: string, friendID?: string) {
  return DoRequestWithToken<MonthRanking[]>(
    `/rankings/track?spotify_uri=${uri}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
}
export async function GetTracksByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  artist_uri?: string,
  album_uri?: string,
  friendID?: string
): Promise<MonthlyTrackRanking[] | ErrorResponse> {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  const response = await DoRequestWithToken<TracksByMonthResponse>(
    `/stats/songs-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${artist_uri ? `&artist_uri=${artist_uri}` : ''}${album_uri ? `&album_uri=${album_uri}` : ''}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )

  if ('error' in response) return response

  const populatedMonthRankings: MonthlyTrackRanking[] = []
  response.rankings.forEach((monthlyRanking) => {
    const populatedTrackRankings: TrackRanking[] = []
    monthlyRanking.tracks?.forEach((trackRanking) => {
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

export type TracksByMonthResponse = {
  rankings: MonthlyTrackRankingResponse[]
  track_data: { [track_id: string]: TrackData }
}

export type MonthlyTrackRankingResponse = Omit<MonthlyTrackRanking, 'tracks'> & {
  tracks?: TrackRankingResponse[]
}

export async function GetTracksByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean,
  friendID?: string
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0)
  return DoRequestWithToken<StreamsByYear>(
    `/stats/tracks-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}${friendID ? `&friend_id=${friendID}` : ''}`,
    'GET',
    token
  )
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
  end: Dayjs = dayjs()
) {
  return DoRequestWithToken<FriendTrackComparison>(
    `/stats/compare-tracks`,
    'GET',
    token,
    undefined,
    undefined,
    undefined,
    { start: start?.unix(), end: end?.unix() }
  )
}
