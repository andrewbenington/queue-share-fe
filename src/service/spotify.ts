export interface SpotifyUser {
  display_name: string
  images: {
    url: string
    height: number
    width: number
  }[]
}

export async function GetUserProfile(token: string): Promise<SpotifyUser | undefined> {
  const response = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + token,
    },
  })

  if (!response.ok) {
    console.error('HTTP status ' + response.status)
    return
  }

  const respBody = await response.json()
  if (!respBody.display_name) {
    console.error('bad user profile response')
    return
  }
  return {
    display_name: respBody.display_name,
    images: respBody.images,
  }
}

export async function RedirectSpotifyLogin(token: string): Promise<SpotifyUser | undefined> {
  const urlResponse = await fetch(
    `${import.meta.env.VITE_BACKEND_URL}/auth/spotify-url?redirect=${
      import.meta.env.VITE_FRONTEND_URL
    }/user`,
    {
      method: 'GET',
      headers: {
        Authorization: 'Bearer ' + token,
      },
    }
  )

  const respBody = await urlResponse.json()
  if (respBody.error) {
    console.error(respBody.error)
    return
  }
  if (!respBody.url) {
    console.error('no url in response')
    return
  }

  window.location.href = respBody.url
}
