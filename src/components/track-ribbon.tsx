import { MusicNote } from '@mui/icons-material'
import { Box, Card, VariantProp } from '@mui/joy'
import { CSSProperties, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { TrackData } from '../types/spotify'

interface TrackRibbonData {
  name: string
  album?: {
    name: string
    uri: string
    images: { url: string; width?: number | null; height?: number | null }[]
  }
  id: string
  image?: { url: string; width?: number | null; height?: number | null }
  image_url?: string
  artists: { name: string; uri: string }[]
  duration_ms?: number
  popularity?: number
}

export type TrackRibbonProps = {
  song?: TrackRibbonData | TrackData
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
  link?: boolean
} & CSSProperties

export function TrackRibbon(props: TrackRibbonProps) {
  const { rightComponent, imageSize, cardVariant, link, ...style } = props
  const song: TrackData | undefined = useMemo(() => {
    const s = props.song
    if (!s) return undefined
    if ('artist_name' in s) return s
    const imageURL =
      s.image_url ??
      s.image?.url ??
      (s.album ? s.album?.images[s.album.images.length - 1]?.url : undefined)

    return {
      ...s,
      image_url: imageURL,
      artist_name: s.artists[0].name,
      artist_uri: s.artists[0].uri,
      album_name: s.album?.name ?? '',
      album_uri: s.album?.uri ?? '',
      duration_ms: s.duration_ms ?? 0,
      popularity: s.popularity ?? 0,
      uri: `spotify:track:${s.id}`,
    }
  }, [props])

  return (
    <Card sx={{ p: 0, mb: 1, fontSize: 11 }} variant={cardVariant} style={style}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {song?.image_url ? (
          <img
            src={song.image_url}
            alt={song?.name ?? 'empty'}
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
          />
        ) : (
          <Box
            width={64}
            height={64}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: 'grey' }}
          >
            <MusicNote fontSize="large" />
          </Box>
        )}
        <Box
          paddingLeft={1}
          flex={1}
          style={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {link ? (
            <Link
              to={`/stats/track/${song?.uri ?? `spotify:track:${song?.id}`}`}
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 'bold',
              }}
            >
              {song?.name}
            </Link>
          ) : (
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: 'bold',
              }}
            >
              {song?.name}
            </div>
          )}
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {link ? (
              <>
                <Link
                  to={`/stats/artist/${song?.artist_uri}`}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                  key={song?.artist_uri}
                >
                  {song?.artist_name}
                </Link>
                {song?.other_artists?.map((artist) => (
                  <>
                    {', '}
                    <Link
                      to={`/stats/artist/${artist.uri}`}
                      style={{
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      key={artist.uri}
                    >
                      {artist.name}
                    </Link>
                  </>
                ))}
              </>
            ) : (
              song?.artist_name ??
              '' + song?.other_artists?.map((artist) => ', ' + artist.name).join('') ??
              ''
            )}
          </div>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  )
}
