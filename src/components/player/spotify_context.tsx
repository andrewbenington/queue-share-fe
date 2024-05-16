import { useMemo } from 'react'
import AlbumDisplay from './album'
import ArtistDisplay from './artist'
import PlaylistDisplay from './playlist'
import { Favorite } from '@mui/icons-material'
import { Box, Typography } from '@mui/material'

type ContextType = 'album' | 'playlist' | 'track' | 'artist' | 'user' | 'local'

interface Context {
  type: ContextType
  id: string
  user?: string
}

export default function SpotifyContext(props: { uri: string }) {
  const { uri } = props
  const context: Context | undefined = useMemo(() => {
    const segments = uri.split(':')
    if (segments.length < 3) return undefined
    if (segments.length === 3) {
      const [, type, id] = segments
      return { type: type as ContextType, id }
    }
    if (segments.length === 4) {
      const [, type, user, id] = segments
      return { type: type as ContextType, id, user }
    }
  }, [uri])

  switch (context?.type) {
    case 'playlist':
      return <PlaylistDisplay id={context.id} />
    case 'album':
      return <AlbumDisplay id={context.id} />
    case 'artist':
      return <ArtistDisplay id={context.id} />
    case 'user':
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <Box
            width={40}
            height={40}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: 'grey', mr: 1 }}
          >
            <Favorite />
          </Box>
          <Typography
            paddingRight={2}
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {context.user}'s Liked Songs
          </Typography>
        </div>
      )
    default:
      return <div>{context?.type ?? '(Nothing up next)'}</div>
  }
}
