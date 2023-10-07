import { Track } from '../state/room';
import { DoRequestWithBasic } from '../util/requests';

export interface QueueResponse {
  currently_playing?: Track;
  queue?: Track[];
}

export async function GetQueue(
  roomCode: string,
  roomPassword: string,
  guestID: string
) {
  return DoRequestWithBasic<QueueResponse>(
    `/room/${roomCode}/queue`,
    'GET',
    guestID,
    roomPassword
  );
}

export async function AddToQueue(
  roomCode: string,
  roomPassword: string,
  songID: string,
  guestID: string
) {
  return DoRequestWithBasic<QueueResponse>(
    `/room/${roomCode}/queue/${songID}`,
    'POST',
    guestID,
    roomPassword
  );
}
