import dayjs, { Dayjs } from 'dayjs'
import { AlbumData, ArtistData, TrackData } from '../../types/spotify'
import { DoRequestWithToken } from '../../util/requests'

export async function GetUpdates(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  friendID?: string
) {
  return DoRequestWithToken<(ArtistUpdate | TrackUpdate | AlbumUpdate)[]>(
    `/stats/artist-events`,
    'GET',
    token,
    {
      query: {
        start_unix: start?.unix(),
        end_unix: end?.unix(),
        friend_id: friendID,
      },
    }
  )
}

export type TrackUpdate = {
  track: TrackData
  streams: number
  rank: number
  surpassed?: TrackUpdate[]
  date_unix: number
}

export type ArtistUpdate = {
  artist: ArtistData
  streams: number
  rank: number
  surpassed?: ArtistUpdate[]
  date_unix: number
}

export type AlbumUpdate = {
  album: AlbumData
  streams: number
  rank: number
  surpassed?: AlbumUpdate[]
  date_unix: number
}

export type NewArtistEntry = {
  artist: ArtistData
  streams: number
  first_stream: string
}

export async function GetNewArtists(token: string, friendID?: string) {
  return DoRequestWithToken<NewArtistEntry[]>(`/stats/new-artists`, 'GET', token, {
    query: {
      friend_id: friendID,
    },
  })
}
