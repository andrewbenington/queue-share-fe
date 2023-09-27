import { Dispatch, createContext, useEffect, useReducer, Reducer } from 'react';
import { CurrentUser } from '../service/user';
import useQuery from '../hooks/query';
import { enqueueSnackbar } from 'notistack';
import { useSearchParams } from 'react-router-dom';

export interface AuthState {
  access_token?: string;
  access_token_expiry?: Date;
  loading: boolean;
  username?: string;
  userDisplayName?: string;
  userSpotifyAccount?: string;
  userSpotifyImageURL?: string;
  error?: string;
}

export type AuthAction =
  | {
      type: 'login';
      payload: LoginPayload;
    }
  | {
      type: 'set_user';
      payload: UserPayload;
    }
  | {
      type: 'loading';
      payload: LoadingPayload;
    }
  | {
      type: 'logout';
    }
  | {
      type: 'error';
      payload: ErrorPayload;
    };

export interface LoginPayload {
  token: string;
  expires_at: Date;
  user?: UserPayload;
}

export interface UserPayload {
  username: string;
  display_name: string;
  spotify_name?: string;
  spotify_image?: string;
}

export type LoadingPayload = boolean;

export type ErrorPayload = string | undefined;

const reducer: Reducer<AuthState, AuthAction> = (
  state: AuthState,
  action: AuthAction
) => {
  switch (action.type) {
    case 'login': {
      const payload = action.payload;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('token_expiry', payload.expires_at.toISOString());
      return {
        ...state,
        access_token: payload.token,
        access_token_expiry: payload.expires_at,
        username: payload.user?.username,
        userDisplayName: payload.user?.display_name,
        userSpotifyAccount: payload.user?.spotify_name,
        userSpotifyImage: payload.user?.spotify_image,
        loading: false,
      };
    }
    case 'set_user': {
      const payload = action.payload;
      return {
        ...state,
        username: payload.username,
        userDisplayName: payload.display_name,
        userSpotifyAccount: payload.spotify_name,
        userSpotifyImageURL: payload.spotify_image,
        loading: false,
      };
    }
    case 'logout': {
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiry');
      return {
        loading: false,
      };
    }
    case 'loading': {
      return {
        ...state,
        loading: action.payload,
      };
    }
    case 'error': {
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    }
    default: {
      return state;
    }
  }
};

const initialState = {
  loading: false,
};

export const AuthContext = createContext<[AuthState, Dispatch<AuthAction>]>([
  initialState,
  () => null,
]);

export const AuthProvider = ({
  children,
}: {
  children: JSX.Element | JSX.Element[];
}) => {
  const [state, dispatch] = useReducer<Reducer<AuthState, AuthAction>>(
    reducer,
    initialState
  );
  const [searchParams, setSearchParams] = useSearchParams();

  // Add token info to state if present in local storage
  useEffect(() => {
    const token = localStorage.getItem('token');
    const token_expiry = localStorage.getItem('token_expiry');

    if (!state.access_token && token && token_expiry) {
      dispatch({
        type: 'login',
        payload: {
          token,
          expires_at: new Date(token_expiry),
        },
      });
    }
  }, [state]);

  // Get user info if token is present and user info is not
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (
      token &&
      state.access_token &&
      !state.username &&
      !state.loading &&
      !state.error
    ) {
      dispatch({
        type: 'loading',
        payload: true,
      });
      CurrentUser(token).then((resp) => {
        if ('error' in resp) {
          if (resp.networkError) {
            enqueueSnackbar('Network error', { variant: 'error' });
            dispatch({
              type: 'error',
              payload: resp.error,
            });
          } else {
            enqueueSnackbar(resp.error, { variant: 'error' });
            localStorage.removeItem('token');
            localStorage.removeItem('token_expiry');
            dispatch({
              type: 'logout',
            });
            dispatch({
              type: 'loading',
              payload: false,
            });
          }
        } else {
          dispatch({
            type: 'set_user',
            payload: {
              ...resp,
            },
          });
        }
      });
    }
  }, [state]);

  // Get spotify info if present in query params
  useEffect(() => {
    const spotify_name = searchParams.get('spotify_name');
    const spotify_image = searchParams.get('spotify_image');
    if (
      state.access_token &&
      state.username &&
      state.userDisplayName &&
      spotify_name &&
      spotify_image
    ) {
      searchParams.delete('spotify_name');
      searchParams.delete('spotify_id');
      searchParams.delete('spotify_image');
      setSearchParams(searchParams);
      dispatch({
        type: 'set_user',
        payload: {
          username: state.username,
          display_name: state.userDisplayName,
          spotify_name,
          spotify_image,
        },
      });
      enqueueSnackbar('Spotify linked successfully', { variant: 'success' });
    }
  }, [state, searchParams]);

  // Snackbar error if present
  useEffect(() => {
    const error = searchParams.get('error');

    if (error) {
      enqueueSnackbar(error, { variant: 'error' });
      searchParams.delete('error');
      setSearchParams(searchParams);
    }
  }, [state, searchParams]);

  return (
    <AuthContext.Provider value={[state, dispatch]}>
      {children}
    </AuthContext.Provider>
  );
};
