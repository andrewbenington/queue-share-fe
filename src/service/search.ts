import { Track } from '../state/queue';
import { DoRequestWithBasic } from '../util/requests';

export async function SearchTracks(
  roomCode: string,
  roomPassword: string,
  term: string
) {
  return DoRequestWithBasic<Track[]>(
    `/room/${roomCode}/search?q=${term}`,
    'GET',
    'user',
    roomPassword
  );
}
