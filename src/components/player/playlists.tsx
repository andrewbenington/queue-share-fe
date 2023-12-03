import { Refresh } from '@mui/icons-material';
import {
  Box,
  IconButton,
  MenuItem,
  TextField,
  TextFieldProps,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { SpotifyPlaylist, UserPlaylists } from '../../service/player_context';
import { AuthContext } from '../../state/auth';
import { RoomContext } from '../../state/room';
import Playlist from './playlist';

interface PlaylistSelectProps extends TextFieldProps<'standard'> {
  onPlaylistSelect: (id: string) => void;
  currentPlaylist?: string;
  refreshButton?: boolean;
}
const PlaylistSelect = (props: PlaylistSelectProps) => {
  const { onPlaylistSelect, currentPlaylist, refreshButton, ...fieldProps } =
    props;
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | undefined>(
    currentPlaylist
  );
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
          console.log('setting selected to ' + e.target.value);
          setSelectedPlaylist(e.target.value);
          onPlaylistSelect(e.target.value);
        }}
        fullWidth
        {...fieldProps}
      >
        {playlists.map((playlist) => (
          <MenuItem key={playlist.id} value={playlist.id}>
            <Playlist playlist={playlist} />
          </MenuItem>
        ))}
      </TextField>
      {refreshButton && (
        <IconButton
          // variant="outlined"
          size="small"
          color="secondary"
          onClick={getUserPlaylists}
          sx={{ mt: 2, mb: 1.5, ml: 0, mr: 1.5, width: 40, height: 40 }}
        >
          <Refresh />
        </IconButton>
      )}
    </Box>
  ) : (
    <div />
  );
};

export default PlaylistSelect;
