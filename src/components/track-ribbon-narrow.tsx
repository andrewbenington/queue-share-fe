import { Box, Card, VariantProp } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { CSSProperties, useContext, useMemo } from 'react'
import { MdMusicNote } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { AddToUserQueue } from '../service/queue'
import { AuthContext } from '../state/auth'
import { TrackData } from '../types/spotify'
import { MinEntry } from '../types/stats'
import { displayError } from '../util/errors'

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
  duration_ms?: number
  popularity?: number
}

export interface TrackRibbonNarrowProps {
  track?: TrackRibbonData | TrackData
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
  style?: CSSProperties
}

export function TrackRibbonNarrow(props: TrackRibbonNarrowProps) {
  const { rightComponent, imageSize, cardVariant, style } = props
  const [authState] = useContext(AuthContext)

  const song: TrackData | MinEntry | undefined = useMemo(() => {
    const s = props.track
    if (!s) return undefined
    if ('artist_name' in s) return s
    const imageURL =
      s.image_url ??
      s.image?.url ??
      (s.album ? s.album?.images[s.album.images.length - 1]?.url : undefined)

    return {
      ...s,
      image_url: imageURL,
      artist_name: '',
      artist_uri: '',
      album_name: s.album?.name ?? '',
      album_uri: s.album?.uri ?? '',
      duration_ms: s.duration_ms ?? 0,
      popularity: s.popularity ?? 0,
      uri: `spotify:track:${s.id}`,
    }
  }, [props])

  return (
    <Card sx={{ p: 0, mb: 1 }} variant={cardVariant} style={style}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {song?.image_url ? (
          <img
            src={song.image_url}
            alt={song?.name ?? 'empty'}
            width={imageSize ?? 32}
            height={imageSize ?? 32}
            style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
            onDoubleClick={() => {
              if (authState?.access_token) {
                AddToUserQueue(authState.access_token, song.uri).then((resp) => {
                  if (resp) {
                    displayError(resp.error)
                  } else {
                    enqueueSnackbar(`Added '${song.name}' to queue`, { variant: 'success' })
                  }
                })
              }
            }}
          />
        ) : (
          <Box
            width={32}
            height={32}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: 'grey' }}
          >
            <MdMusicNote fontSize="large" />
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
          <Link
            to={`/stats/track/${song?.uri ?? `spotify:track:${song?.id}`}`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {song?.name}
          </Link>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  )
}
