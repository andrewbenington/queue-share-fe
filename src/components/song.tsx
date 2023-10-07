import { Grid } from '@mui/material';
import { Track } from '../state/room';

export function Song(props: { song?: Track; rightComponent?: JSX.Element }) {
  const { song, rightComponent } = props;

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
      <Grid item xs={6} style={{ paddingLeft: 10 }}>
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
        xs={4}
        style={{
          paddingLeft: 10,
          display: 'grid',
          justifyContent: 'right',
        }}
      >
        {rightComponent ?? <div />}
      </Grid>
    </Grid>
  );
}
