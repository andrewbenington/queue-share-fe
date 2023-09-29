import { DoRequestWithBasic, DoRequestWithToken } from '../util/requests';

export interface RoomResponse {
  name: string;
  code: string;
  host: {
    username: string;
    display_name: string;
    spotify_name: string;
    spotify_image: string;
  };
}

export async function GetRoom(roomCode: string, password: string) {
  return DoRequestWithBasic<RoomResponse>(
    `/room/${roomCode}`,
    'GET',
    'user',
    password,
    ['name', 'code', 'host']
  );
}

export async function CreateRoom(
  name: string,
  password: string,
  token: string
) {
  return DoRequestWithToken<RoomResponse>(
    '/room',
    'POST',
    token,
    ['name', 'code', 'host'],
    {
      name,
      password,
    }
  );
}
