import { QueueMusic, Search } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GetQueue } from '../service/queue';
import { RoomContext } from '../state/room';
import QueuePage from './queue';
import SearchPage from './search';
import { GetRoom } from '../service/room';

function RoomPage() {
  const { room: code } = useParams();
  const [roomState, dispatchRoomState] = useContext(RoomContext);

  const [tab, setTab] = useState(0);

  const refreshQueue = useCallback(() => {
    const room_pass = localStorage.getItem('room_password');
    if (!room_pass || !roomState.code || roomState.error || roomState.loading) {
      return;
    }
    dispatchRoomState({ type: 'set_loading', payload: true });
    GetQueue(roomState.code, room_pass).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, { variant: 'error' });
        dispatchRoomState({ type: 'set_error', payload: res.error });
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
    });
  }, [code, roomState]);

  useEffect(() => {
    if (
      roomState.code &&
      !roomState.queue &&
      !roomState.error &&
      !roomState.loading
    ) {
      refreshQueue();
    }
  }, [roomState, refreshQueue]);

  useEffect(() => {
    const room_pass = localStorage.getItem('room_password');
    if (
      code &&
      !roomState.code &&
      room_pass &&
      !roomState.loading &&
      !roomState.error
    ) {
      dispatchRoomState({ type: 'set_loading', payload: true });
      GetRoom(code, room_pass).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, { variant: 'error' });
          dispatchRoomState({ type: 'set_error', payload: res.error });
          return;
        }
        dispatchRoomState({
          type: 'join',
          payload: {
            name: res.name,
            host: {
              username: res.host.username,
              userDisplayName: res.host.display_name,
              userSpotifyAccount: res.host.spotify_name,
              userSpotifyImageURL: res.host.spotify_image,
            },
            code: res.code,
            password: room_pass,
          },
        });
      });
    }
  }, [code, roomState]);

  return (
    <Box display="flex" justifyContent="center" style={{ width: 360 }}>
      {roomState.loading ? (
        <CircularProgress />
      ) : tab === 0 ? (
        <QueuePage />
      ) : (
        <SearchPage />
      )}
      <BottomNavigation
        showLabels
        value={tab}
        onChange={(_, val) => {
          if (val === 0) {
            refreshQueue();
          }
          setTab(val);
        }}
        style={{ position: 'fixed', bottom: 0, width: '100%' }}
      >
        <BottomNavigationAction label="Queue" icon={<QueueMusic />} />
        <BottomNavigationAction label="Search" icon={<Search />} />
      </BottomNavigation>
    </Box>
  );
}

export default RoomPage;
