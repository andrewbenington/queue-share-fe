import { Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { Album } from 'spotify-types';
import { GetAlbum } from '../../service/player_context';
import { AuthContext } from '../../state/auth';
import { RoomContext } from '../../state/room';

interface PlaylistProps {
  album?: Album;
  id?: string;
}

export default function AlbumDisplay(props: PlaylistProps) {
  const { id } = props;
  const [album, setAlbum] = useState<Album | undefined>(props.album);
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);

  useEffect(() => {
    if (!roomState || !authState.access_token || !id) return;
    GetAlbum(roomState.code, authState.access_token, id).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      }
      setAlbum(res);
    });
  }, [id]);

  return album ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <img
        src={album.images[0]?.url ?? ''}
        width={40}
        height={40}
        style={{ marginRight: 10 }}
      />
      <Typography
        paddingRight={2}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {album.name}
      </Typography>
    </div>
  ) : (
    <div />
  );
}
