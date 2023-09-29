import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { Song } from '../components/song';
import { RoomContext } from '../state/room';

export default function QueuePage() {
  const [roomState] = useContext(RoomContext);
  if (!roomState?.queue || roomState.queue.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
        <Typography align="center">Host is not playing music</Typography>
      </Box>
    );
  }
  return (
    <div style={{ width: 'inherit' }}>
      <Typography>Now Playing</Typography>
      <Song song={roomState?.currentlyPlaying} />
      <Typography>Up Next</Typography>
      {roomState?.queue?.map((entry, i) => (
        <Song key={`queue_${i}`} song={entry} />
      ))}
    </div>
  );
}
