import { QSTrack } from '../state/room'
import { DoRequestWithRoomCredentials } from '../util/requests'
import { RoomCredentials } from './auth'

export interface QueueResponse {
  currently_playing?: QSTrack
  queue?: QSTrack[]
}

export async function GetQueue(roomCode: string, credentials: RoomCredentials) {
  return DoRequestWithRoomCredentials<QueueResponse>(`/room/${roomCode}/queue`, 'GET', credentials)
}

export async function AddToQueue(roomCode: string, credentials: RoomCredentials, songID: string) {
  return DoRequestWithRoomCredentials<QueueResponse>(
    `/room/${roomCode}/queue/${songID}`,
    'POST',
    credentials
  )
}
