import { Backdrop, Box, Fade, Modal, TextField } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRoom, GetRoom } from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

function HomePage() {
  const [modalState, setModalState] = useState<string>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const navigate = useNavigate();
  const [authState] = useContext(AuthContext);
  const [roomState, dispatchRoomState] = useContext(RoomContext);

  useEffect(() => {
    document.title = 'Queue Share';
  });

  const joinRoom = () => {
    console.log(roomState);
    if (roomState.loading) {
      return;
    }
    dispatchRoomState({ type: 'set_loading', payload: true });
    GetRoom(roomCode, password).then((res) => {
      console.log(res);
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
          password,
        },
      });
    });
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
          password,
        },
      });
      navigate(`/room/${res.code}`);
    });
  };

  useEffect(() => {
    if (roomState.code) {
      navigate(`/room/${roomState.code}`);
    }
  }, [roomState]);

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
        <StyledButton
          variant="outlined"
          onClick={() =>
            authState && !authState.error
              ? setModalState('create')
              : navigate('/login')
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
              onChange={(e) => setRoomCode(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <TextField
              variant="outlined"
              label="Room Password"
              value={password}
              autoComplete="off"
              onChange={(e) => setPassword(e.target.value)}
              type="password"
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
            <StyledButton onClick={createRoom}>Create</StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  );
}

export default HomePage;
