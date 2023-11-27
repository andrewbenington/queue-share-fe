import {
  Backdrop,
  Box,
  Fade,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomPreview } from '../components/room_preview';
import { CreateRoom } from '../service/room';
import {
  CurrentUserHostedRooms,
  CurrentUserJoinedRooms,
  RoomsResponse,
} from '../service/user';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

function HomePage() {
  const [modalState, setModalState] = useState<string>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [hostedRooms, setHostedRooms] = useState<RoomsResponse>();
  const [joinedRooms, setJoinedRooms] = useState<RoomsResponse>();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const navigate = useNavigate();
  const [authState] = useContext(AuthContext);
  const [roomState, dispatchRoomState] = useContext(RoomContext);

  useEffect(() => {
    document.title = 'Queue Share';
    dispatchRoomState({ type: 'clear' });
  });

  useEffect(() => {
    if (authState.access_token && !hostedRooms && !loading) {
      setLoading(true);
      CurrentUserHostedRooms(authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setHostedRooms(res);
      });
    }
  }, [authState, hostedRooms, loading]);

  useEffect(() => {
    if (authState.access_token && !joinedRooms && !loading) {
      setLoading(true);
      CurrentUserJoinedRooms(authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setJoinedRooms(res);
      });
    }
  }, [authState, joinedRooms, loading]);

  const joinRoom = () => {
    localStorage.setItem('room_password', password);
    navigate(`/room/${roomCode}`);
  };

  const createRoom = () => {
    if (!authState.access_token) {
      navigate(`/login`);
      return;
    }
    if (!authState.userSpotifyAccount) {
      enqueueSnackbar('Link a Spotify account to create a room', {
        variant: 'warning',
      });
      navigate(`/user`);
    }
    CreateRoom(roomName, password, authState.access_token).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, { variant: 'error' });
        return;
      }
      const room = res.room;
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
          userIsHost: true,
        },
      });
      navigate(`/room/${room.code}`);
    });
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={360}
    >
      <RoundedRectangle sx={{ mb: 1 }}>
        <StyledButton
          variant="contained"
          style={{ marginBottom: 10 }}
          onClick={() => setModalState('join')}
        >
          Enter Room Code
        </StyledButton>
        {!authState.access_token && localStorage.getItem('room_code') && (
          <StyledButton
            variant="contained"
            style={{ marginBottom: 10 }}
            onClick={() => {
              navigate(
                `/room/${roomState?.code ?? localStorage.getItem('room_code')}`
              );
            }}
          >
            Rejoin "{roomState?.name ?? localStorage.getItem('room_code')}"
          </StyledButton>
        )}
        <StyledButton
          variant="outlined"
          onClick={() =>
            authState?.access_token
              ? setModalState('create')
              : navigate('/login?create_room=true')
          }
        >
          Create Room
        </StyledButton>
      </RoundedRectangle>
      {hostedRooms && hostedRooms.rooms.length > 0 && (
        <>
          <Typography fontWeight="bold">Hosted Rooms</Typography>
          {hostedRooms.rooms.map((room) => (
            <RoomPreview room={room} />
          ))}
        </>
      )}
      {joinedRooms && joinedRooms.rooms.length > 0 && (
        <>
          <Typography fontWeight="bold">Joined Rooms</Typography>
          {joinedRooms.rooms.map((room) => (
            <RoomPreview room={room} />
          ))}
        </>
      )}
      <Modal
        open={modalState === 'join'}
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
              label="Room Code"
              value={roomCode}
              autoComplete="off"
              onChange={(e) => setRoomCode(e.target.value.toLocaleUpperCase())}
              style={{ marginBottom: 10 }}
            />
            <StyledButton onClick={joinRoom}>Join</StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
      <Modal
        open={modalState === 'create'}
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
              label="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <TextField
              variant="outlined"
              label="Room Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <TextField
              variant="outlined"
              label="Confirm Room Password"
              value={passwordVerify}
              onChange={(e) => setPasswordVerify(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <StyledButton onClick={createRoom} variant="contained">
              Create
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  );
}

export default HomePage;
