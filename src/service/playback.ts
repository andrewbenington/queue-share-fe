import { DoRequestWithToken } from '../util/requests';

export async function PlayPlayback(
  roomCode: string,
  token: string,
  deviceID?: string,
  playlistID?: string
) {
  return DoRequestWithToken<null>(
    `/room/${roomCode}/play`,
    'POST',
    token,
    undefined,
    undefined,
    undefined,
    deviceID && playlistID
      ? [
          { key: 'device_id', value: deviceID },
          { key: 'playlist_id', value: playlistID },
        ]
      : undefined
  );
}

export async function PausePlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/pause`, 'POST', token);
}

export async function NextPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/next`, 'POST', token);
}

export async function PreviousPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}/previous`, 'POST', token);
}

export interface PlaybackDevice {
  id: string;
  is_active: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
}

export async function PlaybackDevices(roomCode: string, token: string) {
  return DoRequestWithToken<PlaybackDevice[]>(
    `/room/${roomCode}/devices`,
    'GET',
    token
  );
}

export async function SetPlaybackVolume(
  roomCode: string,
  token: string,
  volume: number
) {
  return DoRequestWithToken<null>(
    `/room/${roomCode}/volume`,
    'PUT',
    token,
    undefined,
    undefined,
    undefined,
    [{ key: 'percent', value: `${volume}` }]
  );
}
