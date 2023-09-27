const scopes = [
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state',
];

export interface SpotifyUser {
  display_name: string;
  images: {
    url: string;
    height: number;
    width: number;
  }[];
}

export async function RedirectSpotifyLoginOld() {
  const codeVerifier = generateRandomString(128);
  localStorage.setItem('spotify_code_verifier', codeVerifier);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const state = generateRandomString(16);
  const scope = scopes.join(' ');

  const args = new URLSearchParams({
    response_type: 'code',
    client_id: import.meta.env.VITE_SPOTIFY_ID,
    scope: scope,
    redirect_uri: import.meta.env.VITE_FRONTEND_URL + '/spotify-redirect',
    state: state,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
  });
  window.location.href = 'https://accounts.spotify.com/authorize?' + args;
}

function generateRandomString(length: number) {
  let text = '';
  const possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

async function generateCodeChallenge(codeVerifier: string) {
  function base64encode(buf: ArrayBuffer) {
    return btoa(
      String.fromCharCode.apply(null, Array.from(new Uint8Array(buf)))
    )
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);

  return base64encode(digest);
}

interface RequestTokenFromCodeResponse {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  error?: string;
}

export async function RequestTokenFromCode(
  code: string
): Promise<RequestTokenFromCodeResponse> {
  const codeVerifier = localStorage.getItem('spotify_code_verifier');
  if (!codeVerifier) {
    return { error: 'spotify_code_verifier not present' };
  }

  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: import.meta.env.VITE_FRONTEND_URL + '/spotify-redirect',
    client_id: import.meta.env.VITE_SPOTIFY_ID,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body,
  });

  const respBody = await response.json();

  if (!response.ok) {
    console.error();
    return { error: respBody.error ?? 'HTTP status ' + response.status };
  }

  if (!respBody.access_token) {
    return { error: 'no access token in response' };
  }

  return respBody;
}

export async function GetUserProfile(
  token: string
): Promise<SpotifyUser | undefined> {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  });

  if (!response.ok) {
    console.error('HTTP status ' + response.status);
    return;
  }

  const respBody = await response.json();
  if (!respBody.display_name) {
    console.error('bad user profile response');
    return;
  }
  return {
    display_name: respBody.display_name,
    images: respBody.images,
  };
}

export async function RedirectSpotifyLogin(
  token: string
): Promise<SpotifyUser | undefined> {
  const urlResponse = await fetch(
    `${
      import.meta.env.VITE_BACKEND_URL
    }/auth/spotify-url?redirect=http://localhost:5173/user`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }
  );

  const respBody = await urlResponse.json();
  if (respBody.error) {
    console.error(respBody.error);
    return;
  }
  if (!respBody.url) {
    console.error('no url in response');
    return;
  }

  window.location.href = respBody.url;
}
