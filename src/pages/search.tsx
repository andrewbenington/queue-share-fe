import { Add, Check, Search } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import QueueContext, { QueueState, Track } from '../state/queue';
import { AddToQueue } from '../service/queue';
import { SearchTracks } from '../service/search';
import { debounce } from 'lodash';

export default function SearchPage(props: {
  roomCode: string;
  setQueueState: (q: QueueState | null) => void;
}) {
  const { roomCode, setQueueState } = props;
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<Track[]>([]);
  const [error, setError] = useState('');
  const [pendingSong, setPendingSong] = useState<string | null>(null);
  const queueState = useContext(QueueContext);

  const addToQueue = (songID: string) => {
    setPendingSong(songID);
    AddToQueue(roomCode, songID)
      .then((newQueue) => {
        if (newQueue.error) {
          console.error(newQueue.error);
          setError(newQueue.error);
        } else {
          setQueueState(newQueue);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setPendingSong(null));
  };

  useEffect(() => {
    const storedSearch = localStorage.getItem('last_search');
    if (search === '' && storedSearch && storedSearch !== '') {
      setSearch(storedSearch);
    }
    if (!storedSearch || storedSearch === '') {
      localStorage.removeItem('last_search');
      localStorage.removeItem('last_search_results');
      setResults([]);
    }
  }, [search]);

  useEffect(() => {
    const storedResults = localStorage.getItem('last_search_results');
    if (search === '' && storedResults && storedResults !== '') {
      setResults(JSON.parse(storedResults));
    }
  }, [search]);

  const getResults = debounce(async () => {
    const tracks = await SearchTracks(roomCode, search);
    setResults(tracks ?? []);
    localStorage.setItem('last_search_results', JSON.stringify(tracks));
  }, 500);

  return (
    <div style={{ width: 'inherit' }}>
      <TextField
        id="search"
        type="search"
        label="Search Spotify"
        //   color="secondary"
        focused
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          localStorage.setItem('last_search', e.target.value);
          getResults();
        }}
        onKeyDown={(ev) => {
          if (ev.key === 'Enter') {
            getResults();
          }
        }}
        sx={{ marginBottom: '10px', marginTop: '10px', width: '100%' }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={getResults}>
                <Search />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      {results?.length ? <Typography>Results:</Typography> : <div />}
      {results?.map((track, i) => (
        <SongResult
          key={`result_${i}`}
          song={track}
          rightComponent={
            <AddToQueueButton
              loading={pendingSong === track.id}
              disabled={!!pendingSong}
              added={queueState?.queue?.some((t) => t.id === track.id) ?? false}
              addToQueue={() => addToQueue(track.id)}
            />
          }
        />
      ))}
      {error !== '' && (
        <Alert
          severity="error"
          style={{ position: 'fixed', bottom: 0, maxWidth: 380 }}
          onClose={() => setError('')}
        >
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
    </div>
  );
}

export function SongResult(props: {
  song?: Track;
  rightComponent?: JSX.Element;
}) {
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
      <Grid item xs={8} style={{ paddingLeft: 10 }}>
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
        xs={2}
        style={{ paddingLeft: 10, display: 'grid', justifyContent: 'right' }}
      >
        {rightComponent ?? <div />}
      </Grid>
    </Grid>
  );
}

function AddToQueueButton(props: {
  added: boolean;
  loading: boolean;
  disabled: boolean;
  addToQueue: () => void;
}) {
  const { added, loading, disabled, addToQueue } = props;
  return added ? (
    <Check style={{ marginRight: 12, color: '#00ff00' }} />
  ) : loading ? (
    <CircularProgress size={20} style={{ marginRight: 12 }} />
  ) : (
    <IconButton
      onClick={addToQueue}
      style={{ marginRight: 4 }}
      disabled={disabled}
    >
      <Add />
    </IconButton>
  );
}
