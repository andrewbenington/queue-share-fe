import {
  DoRequestNoAuth,
  DoRequestWithBasic,
  DoRequestWithToken,
  ErrorResponse,
} from '../util/requests';

interface UserResponseNoSpotify {
  user_id: string;
  username: string;
  display_name: string;
}

export interface UserResponseWithSpotify extends UserResponseNoSpotify {
  spotify_name?: string;
  spotify_image?: string;
}

export interface CreateAccountResponse {
  token: string;
  expires_at: string;
  user: UserResponseNoSpotify;
}

export async function CreateAccount(
  username: string,
  displayName: string,
  password: string
): Promise<CreateAccountResponse | ErrorResponse> {
  const body = {
    username,
    display_name: displayName,
    password,
  };

  return DoRequestNoAuth(
    '/user',
    'POST',
    ['token', 'user', 'expires_at'],
    body
  );
}

export interface UserLoginResponse {
  token: string;
  expires_at: string;
  user: UserResponseWithSpotify;
}

export async function UserLogin(
  username: string,
  password: string
): Promise<UserLoginResponse | ErrorResponse> {
  return DoRequestWithBasic<UserLoginResponse>(
    '/auth/token',
    'GET',
    username,
    password,
    ['token', 'expires_at', 'user']
  );
}

export async function CurrentUser(
  token: string
): Promise<UserResponseWithSpotify | ErrorResponse> {
  return DoRequestWithToken('/user', 'GET', token, [
    'username',
    'display_name',
  ]);
}

export interface CurrentUserRoomResponse {
  room: null | { id: string; code: string; name: string; created: string };
}

export async function CurrentUserRoom(
  token: string
): Promise<CurrentUserRoomResponse | ErrorResponse> {
  return DoRequestWithToken('/user/room', 'GET', token, ['room']);
}
