import { Dispatch, Reducer, createContext, useReducer } from 'react';
import { Track } from './queue';

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
  loading: boolean;
  error?: string;
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
      type: 'set_loading';
      payload: SetLoadingPayload;
    }
  | {
      type: 'set_error';
      payload: SetErrorPayload;
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
}

type SetQueuePayload = { queue: Track[]; currentlyPlaying?: Track } | undefined;
type SetLoadingPayload = boolean;
type SetErrorPayload = string | undefined;

const reducer: Reducer<RoomState, RoomAction> = (
  state: RoomState,
  action: RoomAction
) => {
  // console.log(action.type);
  // console.log(action.payload);
  switch (action.type) {
    case 'join': {
      const { password, ...newState } = action.payload;
      localStorage.setItem('room_password', password);
      return { ...newState, loading: false };
    }
    case 'set_queue': {
      return {
        ...state,
        queue: action.payload?.queue,
        currentlyPlaying: action.payload?.currentlyPlaying,
        loading: false,
      };
    }
    case 'set_loading': {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case 'set_error': {
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    }
    case 'clear': {
      localStorage.removeItem('room_code');
      localStorage.removeItem('room_password');
      return { loading: false };
    }
    default: {
      return state;
    }
  }
};

const initialState = { loading: false };

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
