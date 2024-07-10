import { CurrentlyPlaying, Device } from 'spotify-types'
import { DoRequestWithToken } from '../util/requests'

export async function PlayPlayback(
  roomCode: string,
  token: string,
  deviceID?: string,
  playlistID?: string
) {
  return DoRequestWithToken<null>(`/room/${roomCode}/play`, 'POST', token, {
    query: {
      device_id: deviceID,
      playlist_id: playlistID,
    },
  })
}

export async function PausePlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/pause`, 'POST', token)
}

export async function NextPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/next`, 'POST', token)
}

export async function PreviousPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/previous`, 'POST', token)
}

export async function PlaybackDevices(roomCode: string, token: string) {
  return DoRequestWithToken<Device[]>(`/room/${roomCode}/devices`, 'GET', token)
}

export async function SetPlaybackVolume(roomCode: string, token: string, volume: number) {
  return DoRequestWithToken<null>(`/room/${roomCode}/volume`, 'PUT', token, {
    query: { percent: volume },
  })
}

export interface PlayerState extends CurrentlyPlaying {
  device: Device
  shuffle_state: boolean
  repeat_state: string
}

export async function GetPlayerState(roomCode: string, token: string) {
  return DoRequestWithToken<PlayerState>(`/room/${roomCode}/player`, 'GET', token)
}
