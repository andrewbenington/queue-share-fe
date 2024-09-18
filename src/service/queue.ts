import { QSTrack } from '../state/room'
import { DoRequestWithRoomCredentials, DoRequestWithToken } from '../util/requests'
import { RoomCredentials } from './auth'

export interface QueueResponse {
  currently_playing?: QSTrack
  queue?: QSTrack[]
}

export async function GetQueue(roomCode: string, credentials: RoomCredentials) {
  return DoRequestWithRoomCredentials<QueueResponse>(`/room/${roomCode}/queue`, 'GET', credentials)
}

export async function AddToRoomQueue(
  roomCode: string,
  credentials: RoomCredentials,
  songID: string
) {
  return DoRequestWithRoomCredentials<QueueResponse>(
    `/room/${roomCode}/queue/${songID}`,
    'POST',
    credentials
  )
}

export async function AddToUserQueue(token: string, trackID: string) {
  return DoRequestWithToken<null>(`/user/push-to-queue`, 'POST', token, {
    query: { track: trackID },
  })
}

export type BuildQueueRequest = {
  artist_ids: string[]
  album_ids: string[]
  playlist_ids: string[]
}
export async function BuildQueue(token: string, mix: BuildQueueRequest) {
  return DoRequestWithToken<null>(`/user/build-queue`, 'POST', token, {
    body: mix,
  })
}
