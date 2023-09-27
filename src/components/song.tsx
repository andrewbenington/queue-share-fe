import { Grid, Paper } from '@mui/material';
import { Track } from '../state/queue';

export function Song(props: { song?: Track }) {
  const { song } = props;
  return (
    <Paper>
      <Grid
        container
        style={{
          alignItems: 'center',
          marginBottom: 10,
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
        <Grid item xs={10} style={{ paddingLeft: 10 }}>
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
      </Grid>
    </Paper>
  );
}
