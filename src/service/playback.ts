import { DoRequestWithToken } from '../util/requests';
import { QueueResponse } from './queue';

export async function PlayPlayback(
  roomCode: string,
  token: string,
  deviceID?: string,
  playlistID?: string
) {
  return DoRequestWithToken<QueueResponse>(
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
  return DoRequestWithToken<QueueResponse>(
    `/room/${roomCode}/pause`,
    'POST',
    token
  );
}

export async function NextPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<QueueResponse>(
    `/room/${roomCode}/next`,
    'POST',
    token
  );
}

export async function PreviousPlayback(roomCode: string, token: string) {
  return DoRequestWithToken<QueueResponse>(
    `/room/${roomCode}/previous`,
    'POST',
    token
  );
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
