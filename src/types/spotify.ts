export type TrackData = {
  id: string
  uri: string
  name: string
  album_name: string
  album_uri: string
  artist_name: string
  artist_uri: string
  image_url?: string
  other_artists?: TrackArtist[]
  duration_ms: number
  popularity: number
  isrc?: string
}

export type TrackArtist = {
  id: string
  uri: string
  name: string
}

export type ArtistData = {
  id: string
  uri: string
  name: string
  image_url?: string
  genres: string[]
  popularity: number
  follower_count: number
}

export type AlbumData = {
  id: string
  uri: string
  name: string
  image_url?: string
  artist_name: string
  artist_uri: string
  genres?: string[]
  spotify_track_ids?: string[]
}
