import { MusicNote } from '@mui/icons-material'
import { Box, Card, VariantProp } from '@mui/joy'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Album, Image } from 'spotify-types'

export interface AlbumRibbonProps {
  album?: Album
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
}

export function AlbumRibbon(props: AlbumRibbonProps) {
  const { rightComponent, imageSize, cardVariant } = props
  const album: (Album & { image?: Image }) | undefined = useMemo(() => {
    const s = props.album
    if (!s) return undefined
    if (!('external_ids' in s)) return s
    const lastImage = s.images[s.images.length - 1]
    return {
      ...s,
      image: lastImage
        ? {
            url: lastImage.url,
            height: lastImage.height ?? 32,
            width: lastImage.width ?? 32,
          }
        : undefined,
    }
  }, [props])

  return (
    <Card sx={{ p: 0, mb: 1, fontSize: 11 }} variant={cardVariant}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {album?.images[album.images.length - 1] ? (
          <img
            src={album.images[album.images.length - 1].url}
            alt={album?.name ?? 'empty'}
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
          />
        ) : (
          <Box
            width={48}
            height={48}
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
          <Link
            to={`/stats/album/spotify:album:${album?.id}`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 'bold',
            }}
          >
            {album?.name}
          </Link>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {album?.artists?.map((artist, i) => (
              <Link
                to={`/stats/artist/spotify:artist:${artist.id}`}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
                key={artist.uri}
              >
                <u>{artist.name}</u>
                {i === album?.artists.length - 1 ? '' : ', '}
              </Link>
            ))}
          </div>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  )
}
