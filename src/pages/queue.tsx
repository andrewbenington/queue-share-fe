import { Pause, PlayArrow, SkipNext, SkipPrevious } from '@mui/icons-material';
import {
  Box,
  Chip,
  CircularProgress,
  Collapse,
  Fade,
  IconButton,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useMemo, useState } from 'react';
import DeviceSelect from '../components/devices';
import { LoadingButton } from '../components/loading_button';
import PlaylistSelect from '../components/playlists';
import { Song } from '../components/song';
import {
  NextPlayback,
  PausePlayback,
  PlayPlayback,
  PreviousPlayback,
} from '../service/playback';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { RoundedRectangle } from './styles';

export default function QueuePage(props: { loading: boolean }) {
  const { loading } = props;
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>();
  const [playRequested, setPlayRequested] = useState(false);
  const [playbackLoading, setPlaybackLoading] = useState(false);

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

  if (!roomState?.queue || roomState.queue.length === 0) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        flex={1}
        width={360}
        padding={0}
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
            <DeviceSelect
              onDeviceSelect={setSelectedDevice}
              sx={{ m: 1.5, mt: 2 }}
            />
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
                  if ('error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    });
                    return;
                  }
                  dispatchRoomState({
                    type: 'set_queue',
                    payload: {
                      currentlyPlaying: res.currently_playing,
                      queue: res.queue ?? [],
                    },
                  });
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
    <div style={{ width: 'inherit', marginTop: 8 }}>
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      <Typography fontWeight="bold">Now Playing</Typography>
      <Song
        song={roomState.currentlyPlaying}
        rightComponent={
          roomState.currentlyPlaying?.added_by ? (
            <Chip label={roomState.currentlyPlaying.added_by} />
          ) : undefined
        }
      />
      {roomState.userIsModerator && playbackLoading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box display="flex" justifyContent="center">
          <IconButton
            onClick={() => {
              setPlaybackLoading(true);
              PreviousPlayback(
                roomState.code,
                authState.access_token ?? ''
              ).then((res) => {
                setPlaybackLoading(false);
                if ('error' in res) {
                  enqueueSnackbar(res.error, {
                    variant: 'error',
                    autoHideDuration: 3000,
                  });
                  return;
                }
                dispatchRoomState({
                  type: 'set_queue',
                  payload: {
                    currentlyPlaying: res.currently_playing,
                    queue: res.queue ?? [],
                  },
                });
              });
            }}
          >
            <SkipPrevious />
          </IconButton>
          <IconButton
            onClick={() => {
              setPlaybackLoading(true);
              roomState.currentlyPlaying?.paused
                ? PlayPlayback(
                    roomState.code,
                    authState.access_token ?? '',
                    selectedDevice
                  ).then((res) => {
                    setPlaybackLoading(false);
                    if ('error' in res) {
                      enqueueSnackbar(res.error, {
                        variant: 'error',
                        autoHideDuration: 3000,
                      });
                      return;
                    }
                    dispatchRoomState({
                      type: 'set_queue',
                      payload: {
                        currentlyPlaying: res.currently_playing,
                        queue: res.queue ?? [],
                      },
                    });
                  })
                : PausePlayback(
                    roomState.code,
                    authState.access_token ?? ''
                  ).then((res) => {
                    setPlaybackLoading(false);
                    if ('error' in res) {
                      enqueueSnackbar(res.error, {
                        variant: 'error',
                        autoHideDuration: 3000,
                      });
                      return;
                    }
                    dispatchRoomState({
                      type: 'set_queue',
                      payload: {
                        currentlyPlaying: res.currently_playing,
                        queue: res.queue ?? [],
                      },
                    });
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
              setPlaybackLoading(true);
              NextPlayback(roomState.code, authState.access_token ?? '').then(
                (res) => {
                  setPlaybackLoading(false);
                  if ('error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    });
                    return;
                  }
                  dispatchRoomState({
                    type: 'set_queue',
                    payload: {
                      currentlyPlaying: res.currently_playing,
                      queue: res.queue ?? [],
                    },
                  });
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
          <Typography fontWeight="bold">Queue</Typography>
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
          <Typography fontWeight="bold">Up Next</Typography>
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
    </div>
  );
}
