import dayjs from 'dayjs'
import { TrackData } from '../../types/spotify'
import { MinEntry } from '../../types/stats'
import { DoRequestWithRoomCredentials, DoRequestWithToken } from '../../util/requests'
import { RoomCredentials } from '../auth'
import { MinEntryResponse, MonthRanking } from '../stats'

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
    [{ key: 'q', value: term }]
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
    [{ key: 'q', value: term }]
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

export async function GetTrackStats(token: string, uri: string) {
  const response = await DoRequestWithToken<TrackStatsResponse>(
    `/stats/track?spotify_uri=${uri}`,
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

export async function GetTrackRankings(token: string, uri: string) {
  return DoRequestWithToken<MonthRanking[]>(`/rankings/track?spotify_uri=${uri}`, 'GET', token)
}
