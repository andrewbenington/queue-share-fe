import { DoRequestWithBasic, DoRequestWithToken } from '../util/requests';

export interface CreateAccountResponse {
  token: string;
  expires_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
  };
}

export interface CreateAccountErrorResponse {
  networkError?: boolean;
  usernameTaken: boolean;
  error: string;
}

export async function CreateAccount(
  username: string,
  displayName: string,
  password: string
): Promise<CreateAccountResponse | CreateAccountErrorResponse> {
  const body = {
    username,
    display_name: displayName,
    password,
  };

  let response: Response;

  try {
    response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  } catch (e) {
    return { networkError: true, error: `${e}`, usernameTaken: false };
  }

  if (response.status === 409) {
    return { usernameTaken: true, error: 'Username not available' };
  }

  const respBody = await response.json();

  if (!response.ok) {
    return {
      error: respBody.error ?? 'HTTP status ' + response.status,
      usernameTaken: false,
    };
  }

  return respBody;
}

export interface UserLoginResponse {
  token: string;
  expires_at: string;
  user: {
    id: string;
    username: string;
    display_name: string;
  };
}

export interface ErrorResponse {
  networkError?: boolean;
  error: string;
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

export interface CurrentUserResponse {
  id: string;
  username: string;
  display_name: string;
  spotify_name?: string;
  spotify_image?: string;
}

export async function CurrentUser(
  token: string
): Promise<CurrentUserResponse | ErrorResponse> {
  return DoRequestWithToken('/user', 'GET', token, [
    'username',
    'display_name',
  ]);
}
