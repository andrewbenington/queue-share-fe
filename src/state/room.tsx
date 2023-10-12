import { Dispatch, Reducer, createContext, useReducer } from 'react';

export interface Track {
  id: string;
  name: string;
  artists: string[];
  image: {
    height: number;
    width: number;
    url: string;
  };
  added_by?: string;
  duration_ms: number;
  started_playing_epoch_ms?: number;
}

export interface RoomState {
  name?: string;
  host?: {
    username: string;
    userDisplayName: string;
    userSpotifyAccount: string;
    userSpotifyImageURL: string;
  };
  code?: string;
  currentlyPlaying?: Track;
  queue?: Track[];
  guestName?: string;
}

type RoomAction =
  | {
      type: 'join';
      payload: JoinPayload;
    }
  | {
      type: 'set_queue';
      payload: SetQueuePayload;
    }
  | {
      type: 'set_guest_name';
      payload: SetGuestNamePayload;
    }
  | { type: 'clear' };

interface JoinPayload {
  name: string;
  host: {
    username: string;
    userDisplayName: string;
    userSpotifyAccount: string;
    userSpotifyImageURL: string;
  };
  code: string;
  password: string;
  guestName?: string;
}

type SetQueuePayload = { queue: Track[]; currentlyPlaying?: Track } | undefined;
type SetGuestNamePayload = string | undefined;

const reducer: Reducer<RoomState, RoomAction> = (
  state: RoomState,
  action: RoomAction
) => {
  switch (action.type) {
    case 'join': {
      const { password, ...newState } = action.payload;
      localStorage.setItem('room_password', password);
      return newState;
    }
    case 'set_queue': {
      return {
        ...state,
        queue: action.payload?.queue,
        currentlyPlaying: action.payload?.currentlyPlaying,
      };
    }
    case 'set_guest_name': {
      return {
        ...state,
        guestName: action.payload,
      };
    }
    case 'clear': {
      localStorage.removeItem('room_code');
      localStorage.removeItem('room_password');
      return {};
    }
    default: {
      return state;
    }
  }
};

const initialState = {};

export const RoomContext = createContext<[RoomState, Dispatch<RoomAction>]>([
  initialState,
  () => null,
]);

const RoomProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer<Reducer<RoomState, RoomAction>>(
    reducer,
    initialState
  );

  return (
    <RoomContext.Provider value={[state, dispatch]}>
      {children}
    </RoomContext.Provider>
  );
};

export default RoomProvider;
