export type TableData = {
  schema: string
  table: string
  rel_size_bytes: number
  rel_size_pretty: string
  index_size_bytes: number
  index_size_pretty: string
  total_size_bytes: number
  total_size_pretty: string
  rows_estimate: number
}
export type UncachedTrack = {
  spotify_track_uri: string
  count: number
  track_name: string
  artist_name: string
}
