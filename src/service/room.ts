import {
  DoRequestWithPassword,
  DoRequestWithRoomCredentials,
  DoRequestWithToken,
} from '../util/requests';
import { RoomCredentials } from './auth';
import { UserResponseWithSpotify } from './user';

export interface RoomGuest {
  id: string;
  name: string;
  queued_tracks: number;
}

export interface RoomMember extends UserResponseWithSpotify {
  is_moderator: boolean;
  queued_tracks: number;
}

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
  guest_data?: RoomGuest;
}

export interface RoomGuestResponse {
  id: string;
  name: string;
}

export async function GetRoomNonHost(
  roomCode: string,
  password: string,
  guestID?: string
) {
  return DoRequestWithPassword<RoomResponse>(
    `/room/${roomCode}`,
    'GET',
    guestID ?? '',
    password,
    ['room']
  );
}

export async function JoinRoomAsMember(
  roomCode: string,
  password: string,
  token: string
) {
  return DoRequestWithToken<RoomResponse>(
    `/room/${roomCode}/join`,
    'POST',
    token,
    ['room'],
    undefined,
    undefined,
    [{ key: 'password', value: password }]
  );
}

export async function GetRoomAsMember(roomCode: string, token: string) {
  return DoRequestWithToken<RoomResponse>(`/room/${roomCode}`, 'GET', token, [
    'room',
  ]);
}

export interface RoomPermissionLevel {
  is_member: boolean;
  is_moderator: boolean;
  is_host: boolean;
}

export async function GetRoomPermissions(roomCode: string, token: string) {
  return DoRequestWithToken<RoomPermissionLevel>(
    `/room/${roomCode}/permissions`,
    'GET',
    token
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
  return DoRequestWithPassword<RoomGuestResponse>(
    `/room/${roomCode}/guest`,
    'POST',
    guestID ?? '',
    roomPassword,
    undefined,
    { name }
  );
}

interface RoomGuestsAndMembers {
  guests: RoomGuest[];
  members: RoomMember[];
}

export async function GetRoomGuestsAndMembers(
  roomCode: string,
  roomCredentials: RoomCredentials
) {
  return DoRequestWithRoomCredentials<RoomGuestsAndMembers>(
    `/room/${roomCode}/guests-and-members`,
    'GET',
    roomCredentials,
    ['guests', 'members']
  );
}

export async function DeleteRoom(roomCode: string, token: string) {
  return DoRequestWithToken<null>(`/room/${roomCode}`, 'DELETE', token);
}

export async function SetModerator(
  roomCode: string,
  token: string,
  userID: string,
  isModerator: boolean
) {
  return DoRequestWithToken<null>(
    `/room/${roomCode}/moderator`,
    'PUT',
    token,
    undefined,
    { user_id: userID, is_moderator: isModerator }
  );
}
