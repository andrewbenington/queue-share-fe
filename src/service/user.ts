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

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (response.status === 409) {
    return { usernameTaken: true, error: 'Username not available' };
  }

  const respBody = await response.json();

  if (!response.ok) {
    console.error(respBody.error ?? 'HTTP status ' + response.status);
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
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + btoa(`${username}:${password}`),
    },
  };

  let response: Response;

  try {
    response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/auth/token`,
      options
    );
  } catch (e) {
    return { networkError: true, error: `${e}` };
  }

  const respBody = await response.json();

  if (!response.ok) {
    console.error(respBody.error ?? 'HTTP status ' + response.status);
    return {
      error: respBody.error ?? 'HTTP status ' + response.status,
    };
  }

  if (!respBody.token || !respBody.expires_at) {
    console.error('Bad login response');
    return {
      error: respBody.error ?? 'Bad login response',
    };
  }

  return {
    token: respBody.token,
    expires_at: respBody.expires_at,
    user: respBody.user,
  };
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
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  };

  let response: Response;

  try {
    response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/user`, options);
  } catch (e) {
    return { networkError: true, error: `${e}` };
  }

  const respBody = await response.json();

  if (!response.ok) {
    console.error(respBody.error ?? 'HTTP status ' + response.status);
    return {
      error: respBody.error ?? 'HTTP status ' + response.status,
    };
  }

  if (!respBody.id || !respBody.username || !respBody.display_name) {
    console.error('Bad user response');
    return {
      error: respBody.error ?? 'Bad user response',
    };
  }

  return respBody;
}
