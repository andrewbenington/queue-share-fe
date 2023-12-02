import { Add, Check } from '@mui/icons-material';
import {
  Alert,
  Box,
  CircularProgress,
  Collapse,
  Fade,
  IconButton,
  TextField,
  Typography,
} from '@mui/material';
import { debounce } from 'lodash';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Song } from '../components/song';
import { RoomCredentials } from '../service/auth';
import { AddToQueue } from '../service/queue';
import { SearchTracks, SuggestedTracks } from '../service/tracks';
import { AuthContext } from '../state/auth';
import { RoomContext, Track } from '../state/room';
import useIsMobile from '../hooks/is_mobile';

export default function SearchPage() {
  const [search, setSearch] = useState<string>('');
  const [results, setResults] = useState<Track[]>([]);
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [pendingSong, setPendingSong] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [suggestedTracks, setSuggestedTracks] = useState<Track[]>();
  const [noSuggestionsPermission, setNoSuggestionsPermission] = useState(false);
  const isMobile = useIsMobile();

  const addToQueue = (songID: string) => {
    if (pendingSong || !roomState) {
      return;
    }
    setPendingSong(songID);
    AddToQueue(roomState.code, roomCredentials, songID)
      .then((res) => {
        if ('error' in res) {
          if (res.status === 403) {
            localStorage.removeItem('room_password');
          }
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        } else {
          dispatchRoomState({
            type: 'set_queue',
            payload: {
              currentlyPlaying: res.currently_playing,
              queue: res.queue ?? [],
            },
          });
        }
      })
      .finally(() => setPendingSong(null));
  };

  useEffect(() => {
    if (roomState?.code && !suggestedTracks && !loading) {
      SuggestedTracks(roomState.code, roomCredentials).then((res) => {
        if ('error' in res) {
          if (res.status === 403) {
            setNoSuggestionsPermission(true);
            return;
          }
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setSuggestedTracks(res);
      });
    }
  }, [suggestedTracks]);

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

  const getResults = useCallback(
    debounce(async (searchTerm) => {
      if (!roomState || searchTerm.length < 2) {
        return;
      }
      setLoading(true);
      const res = await SearchTracks(
        roomState.code,
        roomCredentials,
        searchTerm
      );
      setLoading(false);
      if ('error' in res) {
        if (res.status === 403) {
          localStorage.removeItem('room_password');
        }
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        return;
      } else {
        setResults(res);
        localStorage.setItem('last_search_results', JSON.stringify(res));
      }
    }, 500),
    []
  );

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  return (
    <Box width={isMobile ? '97%' : '100%'}>
      <TextField
        id="search"
        type="search"
        label="Search Spotify"
        focused
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          localStorage.setItem('last_search', e.target.value);
          getResults(e.target.value);
        }}
        sx={{
          marginBottom: '10px',
          marginTop: '10px',
          width: '100%',
        }}
        inputProps={{ style: { fontSize: 20 } }}
      />
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      {results?.length ? <Typography>Results:</Typography> : <div />}
      {results?.map((track, i) => (
        <Song
          key={`result_${i}`}
          song={track}
          rightComponent={
            <AddToQueueButton
              loading={pendingSong === track.id}
              disabled={!!pendingSong}
              added={roomState?.queue?.some((t) => t.id === track.id) ?? false}
              addToQueue={() => addToQueue(track.id)}
            />
          }
        />
      ))}

      {(!results || results.length === 0) && (
        <>
          <Typography>Suggestions</Typography>
          {suggestedTracks?.map((track, i) => (
            <Song
              key={`result_${i}`}
              song={track}
              rightComponent={
                <AddToQueueButton
                  loading={pendingSong === track.id}
                  disabled={!!pendingSong}
                  added={
                    roomState?.queue?.some((t) => t.id === track.id) ?? false
                  }
                  addToQueue={() => addToQueue(track.id)}
                />
              }
            />
          ))}
        </>
      )}
      {noSuggestionsPermission && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {roomState?.userIsHost
            ? 'Re-link your Spotify account to allow track suggestions'
            : 'Host must re-link their Spotify account to allow track suggestions'}
        </Alert>
      )}
    </Box>
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
    <Check style={{ color: '#00ff00', marginRight: 8 }} />
  ) : loading ? (
    <CircularProgress size={20} style={{ marginRight: 8 }} />
  ) : (
    <IconButton onClick={addToQueue} disabled={disabled}>
      <Add />
    </IconButton>
  );
}
