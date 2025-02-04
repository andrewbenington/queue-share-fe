import { AlbumData } from '../types/spotify'
import { DoRequestWithToken } from '../util/requests'

export async function SearchAlbums(token: string, term: string) {
  return DoRequestWithToken<AlbumData[]>(`/spotify/search-albums`, 'GET', token, {
    query: { q: term },
  })
}

export async function GetAlbumsByURIs(token: string, uris: string[]) {
  return DoRequestWithToken<{ [id: string]: AlbumData }>(`/spotify/albums-by-uri`, 'GET', token, {
    query: { uris: uris.join(',') },
  })
}
