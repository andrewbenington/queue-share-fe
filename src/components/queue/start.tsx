import { Launch } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  Fade,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useState } from 'react';
import useIsMobile from '../../hooks/is_mobile';
import { RoundedRectangle } from '../../pages/styles';
import { PlayPlayback } from '../../service/playback';
import { AuthContext } from '../../state/auth';
import { RoomContext } from '../../state/room';
import DeviceSelect from './devices_select';
import { LoadingButton } from '../loading_button';
import PlaylistSelect from '../player/playlists';

export default function StartPanel(props: {
  loading: boolean;
  refresh: () => void;
}) {
  const { loading, refresh } = props;
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>();
  const [playRequested, setPlayRequested] = useState(false);
  const isMobile = useIsMobile();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
      width="100%"
      padding={isMobile ? 1 : 0}
    >
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      {loading || roomState?.queue === undefined ? (
        <Typography align="center">Loading...</Typography>
      ) : !roomState?.userIsHost ? (
        <Typography align="center">Host is not playing music</Typography>
      ) : (
        <RoundedRectangle sx={{ width: '100%', p: 0 }}>
          <Alert severity="info" sx={{ m: 1 }}>
            A device will not appear unless the Spotify app or{' '}
            <a href={'https://spotify.com'} target="_blank">
              website
              <Launch fontSize="inherit" />
            </a>{' '}
            is open.
          </Alert>
          <DeviceSelect onDeviceSelect={setSelectedDevice} />
          <PlaylistSelect
            onPlaylistSelect={setSelectedPlaylist}
            refreshButton
            sx={{ m: 1.5 }}
          />

          <LoadingButton
            loading={playRequested}
            onClick={() => {
              setPlayRequested(true);
              PlayPlayback(
                roomState.code,
                authState.access_token ?? '',
                selectedDevice,
                selectedPlaylist
              ).then((res) => {
                setPlayRequested(false);
                if (res && 'error' in res) {
                  enqueueSnackbar(res.error, {
                    variant: 'error',
                    autoHideDuration: 3000,
                  });
                  return;
                }
                new Promise((r) => setTimeout(r, 1000)).then(refresh);
              });
            }}
            sx={{ m: 1.5 }}
            variant="contained"
            disabled={!selectedDevice || !selectedPlaylist}
          >
            Start Playing
          </LoadingButton>
        </RoundedRectangle>
      )}
    </Box>
  );
}
