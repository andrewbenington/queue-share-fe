import { Dayjs } from 'dayjs'

export type StreamingData = {
  count: number
  entries: { [key: string]: MinEntry[] }
  bySongAndDate: { [track_name: string]: { [date: string]: MinEntry[] } }
  byArtistAndDate: { [artist_name: string]: { [date: string]: MinEntry[] } }
}

export type Entry = {
  timestamp: Dayjs
  username: string
  platform: string
  ms_played: number
  conn_country: string
  ip_addr: string
  user_agent: string
  track_name: string
  artist_name: string
  album_name: string
  spotify_track_uri: string
  reason_start: string
  reason_end: string
  shuffle: boolean
  skipped: boolean | null
  offline: boolean
  offline_timestamp: number
  incognito_mode: boolean
}

export type MinEntry = {
  timestamp: Dayjs
  track_name: string
  artist_name: string
  album_name: string
  spotify_track_uri: string
  spotify_artist_uri: string
  spotify_album_uri: string
  ms_played: number
  artists: { name: string; uri: string }[]
  image_url: string
}

export type StreamCount = {
  name: string
  count: number
}
