import { Dispatch, Reducer, createContext, useReducer } from 'react'
import { Track } from 'spotify-types'

export interface QSTrack extends Omit<Track, 'external_ids'> {
  added_by?: string
  started_playing_epoch_ms?: number
  paused?: boolean
  image?: {
    height: number
    width: number
    url: string
  }
}

export type RoomState = {
  name?: string
  host?: {
    username: string
    userDisplayName: string
    userSpotifyAccount: string
    userSpotifyImageURL: string
  }
  code: string
  currentlyPlaying?: QSTrack
  queue?: QSTrack[]
  userIsMember: boolean
  userIsModerator: boolean
  userIsHost: boolean
  guestName?: string
  roomPassword?: string
} | null

type RoomAction =
  | {
      type: 'join'
      payload: JoinPayload
    }
  | {
      type: 'set_permissions'
      payload: SetPermissionsPayload
    }
  | {
      type: 'set_paused'
      payload: SetPausedPayload
    }
  | {
      type: 'set_queue'
      payload: SetQueuePayload
    }
  | {
      type: 'set_guest_name'
      payload: SetGuestNamePayload
    }
  | {
      type: 'set_room_password'
      payload: SetRoomPasswordPayload
    }
  | { type: 'clear' }

type JoinPayload =
  | {
      name: string
      host: {
        username: string
        userDisplayName: string
        userSpotifyAccount: string
        userSpotifyImageURL: string
      }
      code: string
      roomPassword: string
      guestName: string
    }
  | {
      name: string
      host: {
        username: string
        userDisplayName: string
        userSpotifyAccount: string
        userSpotifyImageURL: string
      }
      code: string
      userIsHost?: boolean
      userIsMember?: boolean
      userIsModerator?: boolean
    }

type SetPermissionsPayload = {
  code: string
  is_member: boolean
  is_moderator: boolean
  is_host: boolean
}
type SetQueuePayload = { queue: QSTrack[]; currentlyPlaying?: QSTrack } | undefined
type SetGuestNamePayload = string | undefined
type SetRoomPasswordPayload = string | undefined
type SetPausedPayload = boolean

const reducer: Reducer<RoomState, RoomAction> = (state: RoomState, action: RoomAction) => {
  if (action.type === 'join') {
    localStorage.setItem('room_code', action.payload.code)
    if ('roomPassword' in action.payload) {
      localStorage.setItem('room_password', action.payload.roomPassword)
    }
    return {
      userIsMember: state?.userIsMember ?? false,
      userIsModerator: state?.userIsModerator ?? false,
      userIsHost: state?.userIsHost ?? false,
      ...action.payload,
    }
  }
  if (action.type === 'set_permissions') {
    return {
      ...state,
      code: action.payload.code,
      userIsMember: action.payload.is_member,
      userIsModerator: action.payload.is_moderator,
      userIsHost: action.payload.is_host,
    }
  }
  if (state === null) {
    return null
  }
  switch (action.type) {
    case 'set_paused': {
      if (!state.currentlyPlaying) {
        console.warn('cannot set paused state; no track currently playing')
        return state
      }
      return {
        ...state,
        currentlyPlaying: {
          ...state.currentlyPlaying,
          paused: action.payload,
        },
      }
    }
    case 'set_queue': {
      return {
        ...state,
        queue: action.payload?.queue,
        currentlyPlaying: action.payload?.currentlyPlaying,
      }
    }
    case 'set_guest_name': {
      return {
        ...state,
        guestName: action.payload,
      }
    }
    case 'set_room_password': {
      return {
        ...state,
        roomPassword: action.payload,
      }
    }
    case 'clear': {
      // localStorage.removeItem('room_code');
      // localStorage.removeItem('room_password');
      return null
    }
    default: {
      return state
    }
  }
}

const initialState = null

export const RoomContext = createContext<[RoomState, Dispatch<RoomAction>]>([
  initialState,
  () => null,
])

const RoomProvider = ({ children }: { children: JSX.Element | JSX.Element[] }) => {
  const [state, dispatch] = useReducer<Reducer<RoomState, RoomAction>>(reducer, initialState)

  return <RoomContext.Provider value={[state, dispatch]}>{children}</RoomContext.Provider>
}

export default RoomProvider
