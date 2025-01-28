import { createContext, Dispatch, Reducer, useReducer } from 'react'
import { MinAlbumData } from '../components/album-ribbon'
import { SpotifyPlaylist } from '../service/player_context'
import { ArtistData } from '../types/spotify'

export interface BuilderState {
  artist_ids: Record<string, ArtistData>
  playlist_ids: Record<string, SpotifyPlaylist>
  album_ids: Record<string, MinAlbumData>
}

type IDPayload = {
  type: 'artist' | 'playlist' | 'album'
  id: string
}

type BuilderAction =
  | {
      type: 'add_album'
      payload: MinAlbumData
    }
  | {
      type: 'add_artist'
      payload: ArtistData
    }
  | {
      type: 'add_playlist'
      payload: SpotifyPlaylist
    }
  | {
      type: 'remove_id'
      payload: IDPayload
    }
  | {
      type: 'clear'
      payload?: undefined
    }

const reducer: Reducer<BuilderState, BuilderAction> = (state, action) => {
  switch (action.type) {
    case 'add_artist':
      state.artist_ids[action.payload.id] = action.payload
      return { ...state }
    case 'add_playlist':
      state.playlist_ids[action.payload.id] = action.payload
      return { ...state }
    case 'add_album':
      state.album_ids[action.payload.id] = action.payload
      return { ...state }
    case 'remove_id':
      if (action.payload.type === 'artist') {
        delete state.artist_ids[action.payload.id]
      } else if (action.payload.type === 'playlist') {
        delete state.playlist_ids[action.payload.id]
      } else if (action.payload.type === 'album') {
        delete state.album_ids[action.payload.id]
      }
      return { ...state }
    case 'clear':
      return {
        artist_ids: {},
        album_ids: {},
        playlist_ids: {},
      }
  }
}

const initialState: BuilderState = {
  artist_ids: {},
  album_ids: {},
  playlist_ids: {},
}

export const BuilderContext = createContext<[BuilderState, Dispatch<BuilderAction>]>([
  initialState,
  () => null,
])

const BuilderProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [state, dispatch] = useReducer<Reducer<BuilderState, BuilderAction>>(reducer, initialState)

  return <BuilderContext.Provider value={[state, dispatch]}>{children}</BuilderContext.Provider>
}

export default BuilderProvider
