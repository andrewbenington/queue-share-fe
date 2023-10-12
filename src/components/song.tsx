import { Grid, LinearProgress } from '@mui/material';
import { padStart } from 'lodash';
import { useEffect, useState } from 'react';
import { Track } from '../state/room';

export interface SongProps {
  song?: Track;
  rightComponent?: JSX.Element;
}

export function Song(props: SongProps) {
  const { song, rightComponent } = props;
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (song?.started_playing_epoch_ms) {
      const started_ms = song?.started_playing_epoch_ms;
      const timer = setInterval(() => {
        const progressMillis = Date.now() - started_ms;
        setProgress(Math.min(progressMillis, song.duration_ms));
      }, 1000);

      return () => {
        clearInterval(timer);
      };
    }
  }, [song]);

  function formatTime(time: number): string {
    const minutes = `${Math.floor(Math.abs(time) / 60000)}`;
    const seconds = padStart(
      `${Math.floor(Math.abs(time) / 1000) % 60}`,
      2,
      '0'
    );
    return `${time < 0 ? '-' : ''}${minutes}:${seconds}`;
  }

  return (
    <Grid
      container
      style={{
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#444',
        borderRadius: 5,
        padding: 5,
      }}
    >
      <Grid item xs={2} style={{ display: 'grid', alignItems: 'center' }}>
        <img
          src={song?.image?.url ?? '/next.svg'}
          alt={song?.name ?? 'empty'}
          width={64}
          height={64}
        />
      </Grid>
      <Grid item xs={rightComponent ? 6 : 10} style={{ paddingLeft: 10 }}>
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
      </Grid>
      <Grid
        item
        xs={rightComponent ? 4 : 0}
        style={{
          paddingLeft: 10,
          display: 'grid',
          justifyContent: 'right',
        }}
      >
        {rightComponent ?? <div />}
      </Grid>
      {song?.started_playing_epoch_ms ? (
        <>
          <Grid item xs={12}>
            <LinearProgress
              variant="determinate"
              value={100 * (progress / song.duration_ms)}
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={2}>
            {formatTime(progress)}
          </Grid>
          <Grid item xs={8} />
          <Grid item xs={2} display="grid" justifyContent="right">
            {formatTime(-1 * (song.duration_ms - progress))}
          </Grid>
        </>
      ) : (
        <div />
      )}
    </Grid>
  );
}
