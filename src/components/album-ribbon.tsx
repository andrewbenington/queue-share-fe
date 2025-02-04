import { Box, Card, VariantProp } from '@mui/joy'
import { CSSProperties, useContext, useMemo } from 'react'
import { MdMusicNote } from 'react-icons/md'
import { Link } from 'react-router-dom'
import { BuilderContext } from '../state/builder'
import { AlbumData } from '../types/spotify'

export type AlbumRibbonProps = {
  album?: AlbumData
  rightComponent?: JSX.Element
  imageSize?: number
  cardVariant?: VariantProp
  compact?: boolean
} & CSSProperties

export function AlbumRibbon(props: AlbumRibbonProps) {
  const { album, rightComponent, imageSize: imageSizeProp, cardVariant, compact, ...style } = props
  const [, dispatchBuilderState] = useContext(BuilderContext)
  const imageSize = useMemo(() => imageSizeProp ?? (compact ? 32 : 64), [imageSizeProp, compact])

  return (
    <Card
      sx={{ p: 0, mb: 1, fontSize: 11, width: '100%', maxWidth: 400 }}
      style={style}
      variant={cardVariant}
    >
      <Box display="flex" alignItems="center">
        {album?.image_url ? (
          <img
            src={album.image_url}
            alt={album.name}
            width={imageSize}
            height={imageSize}
            style={{ borderTopLeftRadius: 3, borderBottomLeftRadius: 3 }}
            onDoubleClick={() => dispatchBuilderState({ type: 'add_album', payload: album })}
          />
        ) : (
          <Box
            width={imageSize}
            height={imageSize}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: 'grey' }}
            onDoubleClick={() =>
              album && dispatchBuilderState({ type: 'add_album', payload: album })
            }
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
          {!compact && album && (
            <div
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <Link
                to={`/stats/artist/${album.artist_uri}`}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                <u>{album.artist_name}</u>
              </Link>
            </div>
          )}
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  )
}
