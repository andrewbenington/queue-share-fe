import { Box, Card, VariantProp } from '@mui/joy'
import { CSSProperties, useContext } from 'react'
import { MdPerson } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { BuilderContext } from '../state/builder'
import { ArtistData } from '../types/spotify'

export type ArtistRibbonProps = {
  artist?: ArtistData
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
  compact?: boolean
} & CSSProperties

export function ArtistRibbon(props: ArtistRibbonProps) {
  const { artist, rightComponent, imageSize, cardVariant, compact, ...style } = props
  const [, dispatchBuilderState] = useContext(BuilderContext)

  return (
    <Card
      sx={{ p: 0, fontSize: 11, minHeight: imageSize ?? 64, width: '100%', maxWidth: 400 }}
      variant={cardVariant}
      style={style}
    >
      <Box display="flex" alignItems="center">
        {artist?.image_url ? (
          <img
            src={artist.image_url}
            alt={artist.name}
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
            onDoubleClick={() => dispatchBuilderState({ type: 'add_artist', payload: artist })}
          />
        ) : (
          <Box
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: 'grey' }}
          >
            <MdPerson fontSize="large" />
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
