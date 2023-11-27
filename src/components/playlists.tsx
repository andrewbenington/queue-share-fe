import {
  Box,
  IconButton,
  MenuItem,
  TextField,
  TextFieldProps,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { SpotifyPlaylist, UserPlaylists } from '../service/playlists';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { Refresh } from '@mui/icons-material';

interface PlaylistSelectProps extends TextFieldProps<'standard'> {
  onPlaylistSelect: (id: string) => void;
}
const PlaylistSelect = (props: PlaylistSelectProps) => {
  const { onPlaylistSelect, ...fieldProps } = props;
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>();
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!playlists && !error) {
      getUserPlaylists();
    }
  }, [playlists, error]);

  const getUserPlaylists = () => {
    if (roomState?.code && authState.access_token) {
      UserPlaylists(roomState?.code, authState.access_token).then((res) => {
        if ('error' in res) {
          setError(true);
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        if (res.items.length > 0) {
          setSelectedPlaylist(res.items[0].id);
          onPlaylistSelect(res.items[0].id);
        }
        setPlaylists(res.items);
      });
    }
  };

  return playlists ? (
    <Box display="flex" alignItems="center">
      <TextField
        label="Playlist"
        select
        value={selectedPlaylist}
        onChange={(e) => {
          setSelectedPlaylist(e.target.value);
          onPlaylistSelect(e.target.value);
        }}
        fullWidth
        {...fieldProps}
      >
        {playlists.map((playlist) => (
          <MenuItem value={playlist.id}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <img
                src={playlist.images[0]?.url ?? ''}
                width={32}
                height={32}
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
                {playlist.name}
              </Typography>
            </div>
          </MenuItem>
        ))}
      </TextField>
      <IconButton
        // variant="outlined"
        size="small"
        color="secondary"
        onClick={getUserPlaylists}
        sx={{ mt: 2, mb: 1.5, ml: 0, mr: 1.5, width: 40, height: 40 }}
      >
        <Refresh />
      </IconButton>
    </Box>
  ) : (
    <div />
  );
};

export default PlaylistSelect;
