import {
  Box,
  CircularProgress,
  Collapse,
  Fade,
  Typography,
} from '@mui/material';
import { useContext, useMemo } from 'react';
import { Song } from '../components/song';
import { RoomContext } from '../state/room';

export default function QueuePage(props: { loading: boolean }) {
  const { loading } = props;
  const [roomState] = useContext(RoomContext);

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
      >
        <Collapse
          in={loading}
          style={{ display: 'grid', justifyContent: 'center' }}
        >
          <Fade in={loading} style={{ margin: 10 }}>
            <CircularProgress />
          </Fade>
        </Collapse>
        <Typography align="center">Host is not playing music</Typography>
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
            <div style={{ textAlign: 'right', marginRight: 5 }}>
              <Typography>Added By:</Typography>
              <Typography>{roomState.currentlyPlaying.added_by}</Typography>
            </div>
          ) : undefined
        }
      />
      {lastQueueIndex !== -1 ? (
        <div>
          <Typography fontWeight="bold">Queue</Typography>
          {roomState.queue.slice(0, lastQueueIndex + 1).map((entry, i) => (
            <Song
              key={`queue_${i}`}
              song={entry}
              rightComponent={
                entry.added_by ? (
                  <div style={{ textAlign: 'right', marginRight: 5 }}>
                    <Typography>Added By:</Typography>
                    <Typography>{entry.added_by}</Typography>
                  </div>
                ) : undefined
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
                  entry.added_by ? (
                    <div style={{ textAlign: 'right', marginRight: 5 }}>
                      <Typography>Added By:</Typography>
                      <Typography>{entry.added_by}</Typography>
                    </div>
                  ) : undefined
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
