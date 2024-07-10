import dayjs, { Dayjs } from 'dayjs'
import { Album } from 'spotify-types'
import { ArtistData, TrackData } from '../../types/spotify'
import { DoRequestWithToken } from '../../util/requests'

export async function GetEvents(
  token: string,
  start: Dayjs = dayjs.unix(0),
  end: Dayjs = dayjs(),
  friendID?: string
) {
  return DoRequestWithToken<(ArtistEvent | TrackEvent | AlbumEvent)[]>(
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

export type TrackEvent = {
  track: TrackData
  streams: number
  rank: number
  surpassed?: TrackEvent[]
  date_unix: number
}

export type ArtistEvent = {
  artist: ArtistData
  streams: number
  rank: number
  surpassed?: ArtistEvent[]
  date_unix: number
}

export type AlbumEvent = {
  album: Album
  streams: number
  rank: number
  surpassed?: AlbumEvent[]
  date_unix: number
}
