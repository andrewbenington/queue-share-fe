import { AuthState } from '../state/auth';

export interface RoomResponse {
  name?: string;
  code?: string;
  host_name?: string;
  error?: string;
}

export async function GetRoom(
  roomCode: string,
  password: string
): Promise<RoomResponse> {
  const options = {
    method: 'GET',
    headers: {
      Authorization: 'Basic ' + btoa(`username:${password}`),
    },
  };
  const res = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/${roomCode}`,
    options
  );
  const body = await res.json();
  if (!res.ok && !body?.error) {
    return { error: `${res.status} response` };
  }
  return body;
}

export async function CreateRoom(
  name: string,
  password: string,
  auth: AuthState
): Promise<RoomResponse> {
  const body = {
    name,
    password,
    access_token: auth.access_token,
    access_token_expiry: auth.access_token_expiry,
  };

  const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/room`, {
    method: 'POST',
    body: JSON.stringify(body),
  });

  const respBody = await response.json();

  if (!response.ok) {
    console.error();
    return { error: respBody.error ?? 'HTTP status ' + response.status };
  }

  if (!respBody.code) {
    return { error: 'no room code in response' };
  }
  return respBody;
}
