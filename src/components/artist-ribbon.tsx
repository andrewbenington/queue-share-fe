import { MusicNote } from '@mui/icons-material'
import { Box, Card, VariantProp } from '@mui/joy'
import { CSSProperties, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Artist } from 'spotify-types'
import { ArtistData } from '../types/spotify'

export type ArtistRibbonProps = {
  artist?: Artist | ArtistData
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
  compact?: boolean
} & CSSProperties

type MinArtistData = {
  name: string
  id: string
  image?: string
  popularity?: number
}

export function ArtistRibbon(props: ArtistRibbonProps) {
  const { rightComponent, imageSize, cardVariant, compact, ...style } = props
  const artist: MinArtistData | undefined = useMemo(() => {
    const s = props.artist
    if (!s) return undefined
    const imageURL =
      'image_url' in s
        ? s.image_url
        : 'images' in s && s.images.length
          ? s.images[s.images.length - 1].url
          : undefined
    return {
      ...s,
      image: imageURL,
    }
  }, [props])

  return (
    <Card sx={{ p: 0, fontSize: 11 }} variant={cardVariant} style={style}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {artist?.image ? (
          <img
            src={artist.image}
            alt={artist.name}
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
            to={`/stats/artist/spotify:artist:${artist?.id}`}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 'bold',
            }}
          >
            {artist?.name}
          </Link>
          {!compact && (
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                opacity: 0.8,
              }}
            >
              Popularity: {artist?.popularity}
            </div>
          )}
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  )
}
