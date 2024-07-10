import { ArtistData } from '../types/spotify'
import { DoRequestWithToken } from '../util/requests'

export async function SearchArtists(token: string, term: string) {
  return DoRequestWithToken<ArtistData[]>(`/spotify/search-artists`, 'GET', token, {
    query: { q: term },
  })
}

export async function GetArtistsByURIs(token: string, uris: string[]) {
  return DoRequestWithToken<{ [id: string]: ArtistData }>(`/spotify/artists-by-uri`, 'GET', token, {
    query: { uris: uris.join(',') },
  })
}
