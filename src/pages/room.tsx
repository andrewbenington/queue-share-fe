import { BugReport, QueueMusic, Search } from '@mui/icons-material';
import {
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Fade,
  Modal,
  TextField,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingButton } from '../components/loading_button';
import { GetQueue } from '../service/queue';
import { GetRoom, SetRoomGuest } from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import DebugPage from './debug';
import QueuePage from './queue';
import SearchPage from './search';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

enum PageState {
  NO_PASSWORD,
  PASSWORD_ENTERED,
  ROOM_LOADING,
  NO_GUEST_NAME,
  GUEST_NAME_ENTERED,
  GUEST_NAME_LOADING,
  STALE_QUEUE,
  QUEUE_LOADING,
  READY,
  ERROR,
}

function RoomPage() {
  const { room: code } = useParams();
  const [authState] = useContext(AuthContext);
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [pageState, setPageState] = useState(PageState.NO_PASSWORD);
  const [modalState, setModalState] = useState<string>();
  const [enteredGuestName, setEnteredGuestName] = useState<string>('');
  const [enteredPass, setEnteredPass] = useState<string>('');
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);

  useEffect(() => {
    document.title = `Queue Share - ${roomState.name ?? code}`;
  }, [roomState, code]);

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }
    const password = localStorage.getItem('room_password');
    switch (pageState) {
      case PageState.NO_PASSWORD:
        if (password) {
          setPageState(PageState.ROOM_LOADING);
          loadRoomData(code, password);
        } else if (modalState !== 'password') {
          setModalState('password');
        }
        break;
      case PageState.PASSWORD_ENTERED:
        if (password) {
          setPageState(PageState.ROOM_LOADING);
          loadRoomData(code, password);
        }
        break;
      case PageState.NO_GUEST_NAME:
        if (modalState !== 'guest') {
          setModalState('guest');
        }
        break;
      case PageState.GUEST_NAME_ENTERED:
        if (password) {
          setPageState(PageState.GUEST_NAME_LOADING);
          saveGuestName(code, password);
        } else {
          setPageState(PageState.ERROR);
        }
        break;
      case PageState.STALE_QUEUE:
        if (modalState) {
          setModalState(undefined);
        }
        if (password) {
          setPageState(PageState.QUEUE_LOADING);
          refreshQueue(code, password);
        } else {
          setPageState(PageState.ERROR);
        }
        break;
    }
  }, [pageState]);

  const loadRoomData = (roomCode: string, password: string) => {
    if (!password) {
      enqueueSnackbar('Password not present', { variant: 'error' });
      setPageState(PageState.NO_PASSWORD);
      return;
    }
    GetRoom(
      roomCode,
      password,
      localStorage.getItem('room_guest_id') ?? ''
    ).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, { variant: 'error' });
        setPageState(PageState.ERROR);
        return;
      }
      const room = res.room;
      setPageState(
        res.guest_data ? PageState.STALE_QUEUE : PageState.NO_GUEST_NAME
      );
      dispatchRoomState({
        type: 'join',
        payload: {
          name: room.name,
          host: {
            username: room.host.username,
            userDisplayName: room.host.display_name,
            userSpotifyAccount: room.host.spotify_name,
            userSpotifyImageURL: room.host.spotify_image,
          },
          code: room.code,
          password,
          guestName: res.guest_data?.name,
        },
      });
    });
  };

  const saveGuestName = (roomCode: string, password: string) => {
    setPageState(PageState.GUEST_NAME_LOADING);
    SetRoomGuest(enteredGuestName, roomCode, password).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, { variant: 'error' });
        setPageState(PageState.ERROR);
        return;
      }
      localStorage.setItem('room_guest_id', res.id);
      setPageState(PageState.STALE_QUEUE);
      dispatchRoomState({
        type: 'set_guest_name',
        payload: res.name,
      });
    });
  };

  const refreshQueue = useCallback(
    (roomCode: string, password: string) => {
      if (!(localStorage.getItem('room_guest_id') || authState.username)) {
        return;
      }
      GetQueue(
        roomCode,
        password,
        localStorage.getItem('room_guest_id') ?? ''
      ).then((res) => {
        if ('error' in res) {
          setPageState(PageState.ERROR);
          enqueueSnackbar(res.error, { variant: 'error' });
          return;
        } else {
          setPageState(PageState.READY);
          dispatchRoomState({
            type: 'set_queue',
            payload: {
              currentlyPlaying: res.currently_playing,
              queue: res.queue ?? [],
            },
          });
        }
      });
    },
    [code, authState, localStorage]
  );

  return (
    <Box
      className="scroll-no-bar"
      display="flex"
      justifyContent="center"
      width={360}
      position="absolute"
      style={{
        top: 0,
        bottom: 60,
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      {tab === 0 ? (
        <QueuePage
          loading={
            pageState === PageState.QUEUE_LOADING ||
            pageState === PageState.GUEST_NAME_LOADING ||
            pageState === PageState.ROOM_LOADING
          }
        />
      ) : tab === 1 ? (
        <SearchPage />
      ) : (
        <DebugPage />
      )}
      <BottomNavigation
        showLabels
        value={tab}
        onChange={(_, val) => {
          if (val === 0) {
            setPageState(PageState.STALE_QUEUE);
          }
          setTab(val);
        }}
        style={{ position: 'fixed', bottom: 0, width: '100%', height: 60 }}
      >
        <BottomNavigationAction label="Queue" icon={<QueueMusic />} />
        <BottomNavigationAction label="Search" icon={<Search />} />
        <BottomNavigationAction label="Debug" icon={<BugReport />} />
      </BottomNavigation>
      <Modal
        open={modalState === 'guest'}
        onClose={() => setModalState(undefined)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={!!modalState}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <TextField
              variant="outlined"
              label="Enter Name"
              value={enteredGuestName}
              autoComplete="off"
              onChange={(e) => setEnteredGuestName(e.target.value)}
              sx={{ mb: 1 }}
            />
            <LoadingButton
              loading={pageState === PageState.GUEST_NAME_LOADING}
              variant="contained"
              onClick={() => {
                setPageState(PageState.GUEST_NAME_ENTERED);
              }}
              sx={{ mb: 1 }}
            >
              Join
            </LoadingButton>
            <StyledButton variant="outlined" onClick={() => navigate('/')}>
              Cancel
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
      <Modal
        open={modalState === 'password'}
        onClose={() => setModalState(undefined)}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Fade in={!!modalState}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <TextField
              variant="outlined"
              label="Password"
              value={enteredPass}
              type="password"
              autoComplete="off"
              onChange={(e) => setEnteredPass(e.target.value)}
              sx={{ mb: 1 }}
            />
            <LoadingButton
              loading={pageState === PageState.ROOM_LOADING}
              variant="contained"
              onClick={() => {
                console.log('click');
                localStorage.setItem('room_password', enteredPass);
                setPageState(PageState.PASSWORD_ENTERED);
              }}
              sx={{ mb: 1 }}
            >
              Submit
            </LoadingButton>
            <StyledButton variant="outlined" onClick={() => navigate('/')}>
              Cancel
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  );
}

export default RoomPage;
