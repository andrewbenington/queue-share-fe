import { QueueMusic, Search } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import QueueContext, { QueueState } from '../state/queue';
import { GetQueue } from '../service/queue';
import QueuePage from './queue';
import SearchPage from './search';
import { RoomState } from '../state/room';
import { GetRoom, RoomResponse } from '../service/room';
import { enqueueSnackbar } from 'notistack';

function RoomPage(props: { setRoomState: (state: RoomState | null) => void }) {
  const { room: code } = useParams();
  const { setRoomState } = props;
  const [queueState, setQueueState] = useState<QueueState | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  useEffect(() => {
    const pass = localStorage.getItem(`room_pass`);
    if (!code || !pass) {
      navigate('/');
      return;
    }
    setLoading(true);
    GetRoom(code, pass)
      .then((roomResponse: RoomResponse) => {
        if (roomResponse.error) {
          enqueueSnackbar(roomResponse.error, { variant: 'error' });
          navigate('/');
          return;
        }
        if (!roomResponse.name) {
          console.error('Error getting room');
          return;
        }
        setRoomState({
          name: roomResponse.name,
          code,
          host: roomResponse.host_name ?? '(unknown)',
        });
        document.title = `${roomResponse.name} - Queue Share`;
      })
      .finally(() => setLoading(false));
  }, [code, setRoomState, navigate]);

  const refreshQueue = useCallback(() => {
    if (!code) {
      return;
    }
    GetQueue(code).then((resp) => {
      if (resp.error) {
        console.error(resp.error);
      } else {
        setQueueState(resp);
      }
    });
  }, [code]);

  useEffect(() => {
    if (code && !queueState) {
      refreshQueue();
    }
  }, [queueState, code, refreshQueue]);

  const pages = useMemo(
    () => [
      <QueuePage />,
      <SearchPage roomCode={code ?? ''} setQueueState={setQueueState} />,
    ],
    [code, setQueueState]
  );

  return (
    <QueueContext.Provider value={queueState}>
      <Box display="flex" justifyContent="center" style={{ width: 360 }}>
        {loading ? <CircularProgress /> : pages[tab]}
      </Box>
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
    </QueueContext.Provider>
  );
}

export default RoomPage;
