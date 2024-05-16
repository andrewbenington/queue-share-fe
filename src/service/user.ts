import {
  DoRequestNoAuth,
  DoRequestWithBasic,
  DoRequestWithToken,
  ErrorResponse,
} from '../util/requests'
import { Room } from './room'

interface UserResponseNoSpotify {
  user_id: string
  username: string
  display_name: string
}

export interface UserResponseWithSpotify extends UserResponseNoSpotify {
  spotify_name?: string
  spotify_image?: string
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

  return DoRequestNoAuth('/user', 'POST', ['token', 'user', 'expires_at'], body)
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
  return DoRequestWithBasic<UserLoginResponse>('/auth/token', 'GET', username, password, [
    'token',
    'expires_at',
    'user',
  ])
}

export async function CurrentUser(token: string): Promise<UserResponseWithSpotify | ErrorResponse> {
  return DoRequestWithToken('/user', 'GET', token, ['username', 'display_name'])
}

export interface RoomsResponse {
  rooms: Room[]
}

export async function CurrentUserHostedRooms(
  token: string
): Promise<RoomsResponse | ErrorResponse> {
  return DoRequestWithToken('/user/rooms/hosted', 'GET', token, ['rooms'])
}

export async function CurrentUserJoinedRooms(
  token: string
): Promise<RoomsResponse | ErrorResponse> {
  return DoRequestWithToken('/user/rooms/joined', 'GET', token, ['rooms'])
}

export async function UnlinkSpotify(token: string): Promise<null | ErrorResponse> {
  return DoRequestWithToken('/user/spotify', 'DELETE', token)
}

export type OtherUser = {
  id: string
  username: string
  display_name: string
  spotify_image_url?: string
}

export type FriendReqData = {
  suggestions?: OtherUser[]
  sent_requests?: OtherUser[]
  received_requests?: OtherUser[]
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
  return DoRequestWithToken(`/user/friend?friend_id=${friendID}`, 'DELETE', token)
}
