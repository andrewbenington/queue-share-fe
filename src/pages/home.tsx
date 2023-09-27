import { Backdrop, Box, Fade, Modal, TextField } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreateRoom, GetRoom, RoomResponse } from '../service/room';
import { AuthContext } from '../state/auth';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';
import { enqueueSnackbar } from 'notistack';

function HomePage() {
  const [modalState, setModalState] = useState<string>();
  const [roomName, setRoomName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVerify, setPasswordVerify] = useState('');
  const navigate = useNavigate();
  const [authState] = useContext(AuthContext);

  useEffect(() => {
    document.title = 'Queue Share';
  });

  const joinRoom = () => {
    GetRoom(roomCode, password).then((roomResponse: RoomResponse) => {
      if (roomResponse.error) {
        console.error(roomResponse.error);
        return;
      }
      localStorage.setItem(`room_code`, roomCode);
      localStorage.setItem(`room_pass`, password);
      navigate(`/${roomCode}`);
    });
  };

  const createRoom = () => {
    CreateRoom(roomName, password, authState).then(
      (roomResponse: RoomResponse) => {
        if (roomResponse.error) {
          enqueueSnackbar(roomResponse.error, { variant: 'error' });
          return;
        }
        if (!roomResponse.code) {
          enqueueSnackbar('no room code in response', { variant: 'error' });
          return;
        }
        localStorage.setItem(`room_code`, roomResponse.code);
        localStorage.setItem(`room_pass`, password);
        navigate(`/${roomResponse.code}`);
      }
    );
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
              onChange={(e) => setRoomCode(e.target.value)}
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
