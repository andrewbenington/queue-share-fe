import { Track } from '../state/room';
import { DoRequestWithBasic } from '../util/requests';

export async function SearchTracks(
  roomCode: string,
  roomPassword: string,
  term: string,
  guestID: string
) {
  return DoRequestWithBasic<Track[]>(
    `/room/${roomCode}/search?q=${term}`,
    'GET',
    guestID,
    roomPassword
  );
}
