import {
  DoRequestNoAuth,
  DoRequestWithBasic,
  DoRequestWithToken,
  ErrorResponse,
} from '../util/requests'
import { Room } from './room'

interface UserResponseNoSpotify {
  id: string
  username: string
  display_name: string
}

export interface UserResponseWithSpotify extends UserResponseNoSpotify {
  spotify_name?: string
  spotify_image_url?: string
}

export interface CreateAccountResponse {
  token: string
  expires_at: string
  user: UserResponseNoSpotify
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
  }

  return DoRequestNoAuth('/user', 'POST', {
    expectedFields: ['token', 'user', 'expires_at'],
    body,
  })
}

export interface UserLoginResponse {
  token: string
  expires_at: string
  user: UserResponseWithSpotify
}

export async function UserLogin(
  username: string,
  password: string
): Promise<UserLoginResponse | ErrorResponse> {
  return DoRequestWithBasic<UserLoginResponse>('/auth/token', 'GET', username, password, {
    expectedFields: ['token', 'expires_at', 'user'],
  })
}

export async function CurrentUser(token: string): Promise<UserResponseWithSpotify | ErrorResponse> {
  return DoRequestWithToken('/user', 'GET', token, { expectedFields: ['username', 'display_name'] })
}

export interface RoomsResponse {
  rooms: Room[]
}

export async function CurrentUserHostedRooms(
  token: string
): Promise<RoomsResponse | ErrorResponse> {
  return DoRequestWithToken('/user/rooms/hosted', 'GET', token, { expectedFields: ['rooms'] })
}

export async function CurrentUserJoinedRooms(
  token: string
): Promise<RoomsResponse | ErrorResponse> {
  return DoRequestWithToken('/user/rooms/joined', 'GET', token, { expectedFields: ['rooms'] })
}

export async function UnlinkSpotify(token: string): Promise<null | ErrorResponse> {
  return DoRequestWithToken('/user/spotify', 'DELETE', token)
}

export type UserData = {
  id: string
  username: string
  display_name: string
  spotify_image_url?: string
}

export type FriendReqData = {
  suggestions?: UserData[]
  sent_requests?: UserData[]
  received_requests?: UserData[]
}

export async function GetFriendReqData(token: string): Promise<FriendReqData | ErrorResponse> {
  return DoRequestWithToken('/user/friend-suggestions', 'GET', token)
}

export async function SendFriendRequest(
  token: string,
  friendID: string
): Promise<null | ErrorResponse> {
  return DoRequestWithToken(`/user/friend-request?friend_id=${friendID}`, 'POST', token)
}

export async function DeleteFriendRequest(
  token: string,
  friendID: string
): Promise<null | ErrorResponse> {
  return DoRequestWithToken(`/user/friend-request?friend_id=${friendID}`, 'DELETE', token)
}

export async function AcceptFriendRequest(
  token: string,
  friendID: string
): Promise<null | ErrorResponse> {
  return DoRequestWithToken(`/user/friends?friend_id=${friendID}`, 'POST', token)
}

export async function GetUserFriends(token: string): Promise<UserData[] | ErrorResponse> {
  return DoRequestWithToken(`/user/friends`, 'GET', token)
}

export async function GetUserTracksToProcess(token: string): Promise<number | ErrorResponse> {
  return DoRequestWithToken('/user/to-process', 'GET', token)
}
