import { Backdrop, Box, Fade, Modal, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRoom } from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';
import { CurrentUserRoom, CurrentUserRoomResponse } from '../service/user';

function HomePage() {
  const [modalState, setModalState] = useState<string>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [existingUserRoom, setExistingUserRoom] =
    useState<null | CurrentUserRoomResponse>();
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
    if (authState.access_token && existingUserRoom === undefined && !loading) {
      setLoading(true);
      CurrentUserRoom(authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setExistingUserRoom(res);
      });
    }
  }, [authState, existingUserRoom, loading]);

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
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle>
        <StyledButton
          variant="contained"
          style={{ marginBottom: 10 }}
          onClick={() => setModalState('join')}
        >
          Join Room
        </StyledButton>
        {((localStorage.getItem('room_code') &&
          localStorage.getItem('room_code') !== existingUserRoom?.room?.code) ||
          (roomState && roomState.code !== existingUserRoom?.room?.code)) && (
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
        {existingUserRoom?.room && (
          <StyledButton
            variant="contained"
            style={{ marginBottom: 10 }}
            onClick={() => navigate(`/room/${existingUserRoom.room?.code}`)}
          >
            Rejoin "{existingUserRoom.room.name}"
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
      <Modal
        open={modalState == 'join'}
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
        open={modalState == 'create'}
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
