import { DoRequestWithBasic, DoRequestWithToken } from '../util/requests';

export interface RoomResponse {
  room: {
    name: string;
    code: string;
    host: {
      username: string;
      display_name: string;
      spotify_name: string;
      spotify_image: string;
    };
  };
  guest_data?: {
    id: string;
    name: string;
  };
}

export interface RoomGuestResponse {
  id: string;
  name: string;
}

export async function GetRoom(
  roomCode: string,
  password: string,
  guestID?: string
) {
  return DoRequestWithBasic<RoomResponse>(
    `/room/${roomCode}`,
    'GET',
    guestID ?? '',
    password,
    ['room']
  );
}

export async function CreateRoom(
  name: string,
  password: string,
  token: string
) {
  return DoRequestWithToken<RoomResponse>('/room', 'POST', token, ['room'], {
    name,
    password,
  });
}

export async function SetRoomGuest(
  name: string,
  roomCode: string,
  roomPassword: string,
  guestID?: string
) {
  return DoRequestWithBasic<RoomGuestResponse>(
    `/room/${roomCode}/guest`,
    'POST',
    guestID ?? '',
    roomPassword,
    undefined,
    { name }
  );
}
