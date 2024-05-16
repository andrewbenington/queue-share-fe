import { ArtistData } from '../types/spotify'
import { DoRequestWithToken } from '../util/requests'

export async function SearchArtists(token: string, term: string) {
  return DoRequestWithToken<ArtistData[]>(
    `/spotify/search-artists`,
    'GET',
    token,
    undefined,
    undefined,
    undefined,
    [{ key: 'q', value: term }]
  )
}
