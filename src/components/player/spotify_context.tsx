import { useMemo } from 'react';
import PlaylistDisplay from './playlist';
import AlbumDisplay from './album';
import ArtistDisplay from './artist';
import { Box } from '@mui/material';

type ContextType = 'album' | 'playlist' | 'track' | 'artist' | 'user' | 'local';

interface Context {
  type: ContextType;
  id: string;
  user?: string;
}

export default function SpotifyContext(props: { uri: string }) {
  const { uri } = props;
  const context: Context | undefined = useMemo(() => {
    const segments = uri.split(':');
    if (segments.length < 3) return undefined;
    if (segments.length === 3) {
      const [, type, id] = segments;
      return { type: type as ContextType, id };
    }
    if (segments.length === 4) {
      const [, type, user, id] = segments;
      return { type: type as ContextType, id, user };
    }
  }, [uri]);

  switch (context?.type) {
    case 'playlist':
      return <PlaylistDisplay id={context.id} />;
    case 'album':
      return <AlbumDisplay id={context.id} />;
    case 'artist':
      return <ArtistDisplay id={context.id} />;
    case 'user':
      return <Box>{`User ${context.user}: ${context.id}`}</Box>;
    default:
      return <div>{context?.type ?? '(Nothing up next)'}</div>;
  }
}
