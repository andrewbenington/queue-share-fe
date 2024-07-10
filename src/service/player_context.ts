import { Album, Artist, Playlist } from 'spotify-types'
import { DoRequestWithToken } from '../util/requests'

interface UserPlaylistsResponse {
  items: SpotifyPlaylist[]
}

export interface SpotifyPlaylist {
  id: string
  name: string
  images?: {
    url: string
    height: number
    width: number
  }[]
}

export async function UserPlaylists(roomCode: string, token: string) {
  return DoRequestWithToken<UserPlaylistsResponse>(`/room/${roomCode}/playlists`, 'GET', token, {
    expectedFields: ['items'],
  })
}

export async function GetPlaylist(roomCode: string, token: string, playlistID: string) {
  return DoRequestWithToken<Playlist>(`/room/${roomCode}/playlist`, 'GET', token, {
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
