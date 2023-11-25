import { Track } from '../state/room';
import { DoRequestWithRoomCredentials } from '../util/requests';
import { RoomCredentials } from './auth';

export async function SearchTracks(
  roomCode: string,
  roomCredentials: RoomCredentials,
  term: string
) {
  return DoRequestWithRoomCredentials<Track[]>(
    `/room/${roomCode}/search`,
    'GET',
    roomCredentials,
    undefined,
    undefined,
    undefined,
    [{ key: 'q', value: term }]
  );
}

export async function SuggestedTracks(
  roomCode: string,
  roomCredentials: RoomCredentials
) {
  return DoRequestWithRoomCredentials<Track[]>(
    `/room/${roomCode}/suggested`,
    'GET',
    roomCredentials
  );
}
