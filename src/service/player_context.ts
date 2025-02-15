import { Album, Artist } from 'spotify-types'
import { TrackData } from '../types/spotify'
import { DoRequestWithToken } from '../util/requests'

interface UserPlaylistsResponse {
  items: QSPlaylist[]
}

export interface QSPlaylist {
  id: string
  uri: string
  name: string
  description: string
  image_url?: string
  first_added?: string
  is_public: boolean
  collaborative: boolean
  tracks?: TrackData[]
}

export async function RoomPlaylists(roomCode: string, token: string) {
  return DoRequestWithToken<UserPlaylistsResponse>(`/room/${roomCode}/playlists`, 'GET', token)
}

export async function UserPlaylists(token: string) {
  return DoRequestWithToken<QSPlaylist[]>(`/user/playlists`, 'GET', token)
}

export async function GetPlaylist(roomCode: string, token: string, playlistID: string) {
  return DoRequestWithToken<QSPlaylist>(`/room/${roomCode}/playlist`, 'GET', token, {
    query: {
      id: playlistID,
    },
  })
}

export async function GetAlbum(roomCode: string, token: string, albumID: string) {
  return DoRequestWithToken<Album>(`/room/${roomCode}/album`, 'GET', token, {
    query: {
      id: albumID,
    },
  })
}

export async function GetArtist(roomCode: string, token: string, artistID: string) {
  return DoRequestWithToken<Artist>(`/room/${roomCode}/artist`, 'GET', token, {
    query: {
      id: artistID,
    },
  })
}
