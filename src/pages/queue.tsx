import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { Song } from '../components/song';
import QueueContext from '../state/queue';

export default function QueuePage() {
  const queueState = useContext(QueueContext);
  if (!queueState?.queue || queueState.queue.length === 0) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
        <Typography align="center">Host is not playing music</Typography>
      </Box>
    );
  }
  return (
    <div>
      <Typography>Now Playing</Typography>
      <Song song={queueState?.currently_playing} />
      <Typography>Up Next</Typography>
      {queueState?.queue?.map((entry, i) => (
        <Song key={`queue_${i}`} song={entry} />
      ))}
    </div>
  );
}
