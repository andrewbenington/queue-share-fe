import { Track } from '../state/queue';
import { DoRequestWithBasic } from '../util/requests';

export interface QueueResponse {
  currently_playing?: Track;
  queue?: Track[];
}

export async function GetQueue(roomCode: string, roomPassword: string) {
  return DoRequestWithBasic<QueueResponse>(
    `/room/${roomCode}/queue`,
    'GET',
    'user',
    roomPassword
  );
}

export async function AddToQueue(
  roomCode: string,
  roomPassword: string,
  songID: string
) {
  return DoRequestWithBasic<QueueResponse>(
    `/room/${roomCode}/queue/${songID}`,
    'POST',
    'user',
    roomPassword
  );
}
