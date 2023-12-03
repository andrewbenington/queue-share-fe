import { MusicNote } from '@mui/icons-material';
import { Box } from '@mui/material';
import { useMemo } from 'react';
import { Track } from 'spotify-types';
import { RoundedRectangle } from '../pages/styles';
import { QSTrack } from '../state/room';

export interface SongProps {
  song?: QSTrack | Track;
  rightComponent?: JSX.Element;
}

export function Song(props: SongProps) {
  const { rightComponent } = props;
  const song: QSTrack | undefined = useMemo(() => {
    const s = props.song;
    if (!s) return undefined;
    if (!('external_ids' in s)) return s;
    const lastImage = s.album.images[s.album.images.length - 1];
    return {
      ...s,
      image: lastImage
        ? {
            url: lastImage.url,
            height: lastImage.height ?? 32,
            width: lastImage.width ?? 32,
          }
        : undefined,
      artists: s.artists.map((a) => a.name),
    };
  }, [props]);

  return (
    <RoundedRectangle sx={{ p: 0.5, mb: 1 }}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {song?.image ? (
          <img
            src={song.image.url}
            alt={song?.name ?? 'empty'}
            width={64}
            height={64}
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
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {song?.artists?.join(', ')}
          </div>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </RoundedRectangle>
  );
}
