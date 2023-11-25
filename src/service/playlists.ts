import { DoRequestWithToken } from '../util/requests';

interface UserPlaylistsResponse {
  items: SpotifyPlaylist[];
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}

export async function UserPlaylists(roomCode: string, token: string) {
  return DoRequestWithToken<UserPlaylistsResponse>(
    `/room/${roomCode}/playlists`,
    'GET',
    token,
    ['items']
  );
}
