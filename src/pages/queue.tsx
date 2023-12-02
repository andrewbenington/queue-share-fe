import {
  Launch,
  Pause,
  PlayArrow,
  SkipNext,
  SkipPrevious,
  VolumeDown,
  VolumeUp,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Fade,
  IconButton,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useMemo, useState } from 'react';
import DeviceSelect from '../components/devices';
import { LoadingButton } from '../components/loading_button';
import PlaylistSelect from '../components/playlists';
import { Song } from '../components/song';
import useIsMobile from '../hooks/is_mobile';
import {
  NextPlayback,
  PausePlayback,
  PlayPlayback,
  PreviousPlayback,
  SetPlaybackVolume,
} from '../service/playback';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { RoundedRectangle } from './styles';

export default function QueuePage(props: {
  loading: boolean;
  refresh: () => void;
}) {
  const { loading, refresh } = props;
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>();
  const [playRequested, setPlayRequested] = useState(false);
  const isMobile = useIsMobile();
  const [volume, setVolume] = useState<number>(0);

  const lastQueueIndex: number = useMemo(() => {
    let index = -1;
    if (roomState) {
      roomState.queue?.forEach((entry, i) => {
        if (entry.added_by) {
          index = i;
        }
      });
    }
    return index;
  }, [roomState]);

  const updateVolume = async (value: number) => {
    if (!roomState || !authState.access_token) {
      return;
    }
    const res = await SetPlaybackVolume(
      roomState.code,
      authState.access_token,
      value
    );
    if (res && 'error' in res) {
      enqueueSnackbar(res.error, {
        variant: 'error',
        autoHideDuration: 3000,
      });
      return;
    }
  };

  if (!roomState?.queue || roomState.queue.length === 0) {
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

  return (
    <Box width={isMobile ? '97%' : '100%'} mt={1}>
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      <Typography fontWeight="bold" mb={1}>
        Now Playing
      </Typography>
      <Song
        song={roomState.currentlyPlaying}
        rightComponent={
          roomState.currentlyPlaying?.added_by ? (
            <Chip label={roomState.currentlyPlaying.added_by} />
          ) : undefined
        }
      />
      {roomState.userIsModerator && (
        <Box display="flex" justifyContent="center" alignItems="center" mb={1}>
          <Stack spacing={2} direction="row" alignItems="center" flex={1}>
            <VolumeDown />
            <Slider
              aria-label="Volume"
              value={volume ?? 0}
              onChange={(e) => {
                if (!e.target) return;
                const target = e.target as { value?: number };
                if (!target.value) return;
                setVolume(target.value);
              }}
              onChangeCommitted={() => {
                updateVolume(volume);
              }}
              disabled={volume === undefined}
            />
            <VolumeUp />
          </Stack>
          <IconButton
            onClick={() => {
              PreviousPlayback(
                roomState.code,
                authState.access_token ?? ''
              ).then((res) => {
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
          >
            <SkipPrevious />
          </IconButton>
          <IconButton
            disabled={playRequested}
            onClick={() => {
              setPlayRequested(true);
              roomState.currentlyPlaying?.paused
                ? PlayPlayback(
                    roomState.code,
                    authState.access_token ?? '',
                    selectedDevice
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
                  })
                : PausePlayback(
                    roomState.code,
                    authState.access_token ?? ''
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
              dispatchRoomState({
                type: 'set_paused',
                payload: !roomState.currentlyPlaying?.paused,
              });
            }}
          >
            {roomState.currentlyPlaying?.paused ? <PlayArrow /> : <Pause />}
          </IconButton>
          <IconButton
            onClick={() => {
              NextPlayback(roomState.code, authState.access_token ?? '').then(
                (res) => {
                  if (res && 'error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    });
                    return;
                  }
                  new Promise((r) => setTimeout(r, 1000)).then(refresh);
                }
              );
            }}
          >
            <SkipNext />
          </IconButton>
        </Box>
      )}
      {lastQueueIndex !== -1 ? (
        <div>
          <Typography fontWeight="bold" mb={1}>
            Queue
          </Typography>
          {roomState.queue.slice(0, lastQueueIndex + 1).map((entry, i) => (
            <Song
              key={`queue_${i}`}
              song={entry}
              rightComponent={
                entry.added_by ? <Chip label={entry.added_by} /> : undefined
              }
            />
          ))}
        </div>
      ) : (
        <div />
      )}
      {lastQueueIndex < roomState.queue.length ? (
        <div>
          <Typography fontWeight="bold" mb={1}>
            Up Next
          </Typography>
          {roomState.queue
            .slice(lastQueueIndex === -1 ? 0 : lastQueueIndex + 1)
            .map((entry, i) => (
              <Song
                key={`queue_${
                  lastQueueIndex === -1 ? i : lastQueueIndex + 1 + i
                }`}
                song={entry}
                rightComponent={
                  entry.added_by ? <Chip label={entry.added_by} /> : undefined
                }
              />
            ))}
        </div>
      ) : (
        <div />
      )}
    </Box>
  );
}
