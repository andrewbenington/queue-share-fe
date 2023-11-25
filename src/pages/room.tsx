import { Add, Group, QueueMusic, Settings } from '@mui/icons-material';
import {
  Backdrop,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Fade,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { LoadingButton } from '../components/loading_button';
import { RoomCredentials } from '../service/auth';
import { GetQueue } from '../service/queue';
import {
  GetRoomAsMember,
  GetRoomNonHost,
  GetRoomPermissions,
  SetRoomGuest,
} from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';
import DebugPage from './debug';
import QueuePage from './queue';
import RoomInfoPage from './room_info';
import RoomSettingsPage from './room_settings';
import SearchPage from './search';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

enum PageState {
  NO_DATA,
  NO_PASSWORD,
  SHOULD_LOAD_ROOM,
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
  const [pageState, setPageState] = useState(PageState.NO_DATA);
  const [modalState, setModalState] = useState<string>();
  const [enteredGuestName, setEnteredGuestName] = useState<string>('');
  const [enteredPass, setEnteredPass] = useState<string>('');
  const navigate = useNavigate();

  const [tab, setTab] = useState(0);

  useEffect(() => {
    if (roomState) {
      document.title = `Queue Share - ${roomState.name}`;
      localStorage.setItem('room_code', roomState.code);
    }
  }, [roomState, code]);

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  const refreshQueue = useCallback(
    (roomCode: string) => {
      GetQueue(roomCode, roomCredentials).then((res) => {
        if ('error' in res) {
          if (res.status === 403) {
            localStorage.removeItem('room_password');
            setPageState(PageState.NO_PASSWORD);
            return;
          }
          setPageState(PageState.ERROR);
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setPageState(PageState.READY);
        dispatchRoomState({
          type: 'set_queue',
          payload: {
            currentlyPlaying: res.currently_playing,
            queue: res.queue ?? [],
          },
        });
      });
    },
    [code, authState, localStorage, roomCredentials]
  );

  useEffect(() => {
    if (!code) {
      navigate('/');
      return;
    }
    const password =
      roomState?.roomPassword ?? localStorage.getItem('room_password') ?? '';
    if (!authHasLoaded(authState)) {
      return;
    }
    switch (pageState) {
      case PageState.NO_DATA:
        // load room host to verify room exists and
        // to let us check if the user owns it (and
        // not prompt for a password)
        if (authState.access_token) {
          getRoomPermissions(code);
        } else {
          setPageState(PageState.NO_PASSWORD);
        }
        break;
      case PageState.NO_PASSWORD:
        if (password) {
          setPageState(PageState.SHOULD_LOAD_ROOM);
        } else if (modalState !== 'password') {
          setModalState('password');
        }
        break;
      case PageState.SHOULD_LOAD_ROOM:
        setPageState(PageState.ROOM_LOADING);
        if (roomState?.userIsMember) {
          loadRoomAsMember(code);
        } else if (password) {
          loadRoomAsGuest(code, password);
        } else {
          setPageState(PageState.NO_PASSWORD);
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
        setPageState(PageState.QUEUE_LOADING);
        refreshQueue(code);
        break;
    }
  }, [pageState, authState]);

  useEffect(() => {
    if (
      code &&
      roomState?.currentlyPlaying?.started_playing_epoch_ms &&
      !roomState?.currentlyPlaying?.paused
    ) {
      const timer = setTimeout(() => {
        refreshQueue(code);
      }, roomState.currentlyPlaying.duration_ms - (Date.now() - roomState.currentlyPlaying.started_playing_epoch_ms));
      return () => {
        clearTimeout(timer);
      };
    }
  }, [code, refreshQueue, roomState]);

  const getRoomPermissions = (roomCode: string) => {
    GetRoomPermissions(roomCode, authState.access_token ?? '').then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        setPageState(PageState.ERROR);
        if (res.status === 404) {
          localStorage.removeItem('room_code');
          localStorage.removeItem('room_password');
          dispatchRoomState({ type: 'clear' });
          setModalState('not_found');
        }
        return;
      }
      dispatchRoomState({
        type: 'set_permissions',
        payload: { ...res, code: code ?? '' },
      });
      if (res.is_member) {
        setPageState(PageState.SHOULD_LOAD_ROOM);
      } else {
        setPageState(PageState.NO_PASSWORD);
      }
    });
  };

  const loadRoomAsMember = (roomCode: string) => {
    if (!authState.access_token) {
      enqueueSnackbar('User not authenticated', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setPageState(PageState.ERROR);
      return;
    }
    GetRoomAsMember(roomCode, authState.access_token).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        setPageState(PageState.ERROR);
        return;
      }
      const room = res.room;
      setPageState(PageState.STALE_QUEUE);
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
        },
      });
    });
  };

  const loadRoomAsGuest = (roomCode: string, password: string) => {
    if (!password) {
      enqueueSnackbar('Password not present', {
        variant: 'error',
        autoHideDuration: 3000,
      });
      setPageState(PageState.NO_PASSWORD);
      return;
    }

    GetRoomNonHost(
      roomCode,
      password,
      localStorage.getItem('room_guest_id') ?? ''
    ).then((res) => {
      if ('error' in res) {
        if (res.status === 403) {
          localStorage.removeItem('room_password');
          setPageState(PageState.NO_PASSWORD);
          return;
        }
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
        setPageState(PageState.ERROR);
        return;
      }
      const room = res.room;
      setPageState(
        res.guest_data || roomState?.userIsHost
          ? PageState.STALE_QUEUE
          : PageState.NO_GUEST_NAME
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
          roomPassword: password,
          guestName: res.guest_data?.name ?? '',
        },
      });
    });
  };

  const saveGuestName = (roomCode: string, password: string) => {
    setPageState(PageState.GUEST_NAME_LOADING);
    SetRoomGuest(enteredGuestName, roomCode, password).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        });
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
      ) : tab === 2 ? (
        <RoomInfoPage />
      ) : tab === 3 ? (
        <RoomSettingsPage />
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
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 60,
        }}
      >
        <BottomNavigationAction label="Queue" icon={<QueueMusic />} />
        <BottomNavigationAction label="Add Songs" icon={<Add />} />
        <BottomNavigationAction label="Members" icon={<Group />} />
        {roomState?.userIsHost && (
          <BottomNavigationAction label="Settings" icon={<Settings />} />
        )}
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
              label="Your Name"
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
                localStorage.setItem('room_password', enteredPass);
                dispatchRoomState({
                  type: 'set_room_password',
                  payload: enteredPass,
                });
                setPageState(PageState.SHOULD_LOAD_ROOM);
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
      <Modal
        open={modalState === 'not_found'}
        onClose={() => navigate('/')}
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
            <Typography mb={1}>
              A room with the given code doesn't exist.
            </Typography>
            <StyledButton
              variant="contained"
              onClick={() => {
                localStorage.removeItem('room_code');
                navigate('/');
              }}
            >
              OK
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  );
}

export default RoomPage;
