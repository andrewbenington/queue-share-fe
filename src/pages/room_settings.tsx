import { Backdrop, Box, Button, Fade, Modal, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomCredentials } from '../service/auth';
import { DeleteRoom, GetRoomGuestsAndMembers } from '../service/room';
import { UserResponseWithSpotify } from '../service/user';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

interface Guest {
  id: string;
  name: string;
}

export default function RoomSettingsPage() {
  const [roomState, dispatchRoomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [guests, setGuests] = useState<Guest[]>();
  const [, setMembers] = useState<UserResponseWithSpotify[]>();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  useEffect(() => {
    if (roomState && guests === undefined && authHasLoaded(authState)) {
      GetRoomGuestsAndMembers(roomState.code, roomCredentials).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          });
          return;
        }
        setGuests(res.guests);
        setMembers(res.members);
      });
    }
  }, [guests, roomState, authState]);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle>
        <StyledButton
          onClick={() => setModalOpen(true)}
          variant="contained"
          color="error"
        >
          Delete Room
        </StyledButton>
      </RoundedRectangle>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
        <Fade in={modalOpen}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <Typography mb={1}>Delete room?</Typography>
            <Button
              variant="contained"
              color="error"
              style={{ marginBottom: 10 }}
              onClick={() => {
                localStorage.removeItem('room_code');
                localStorage.removeItem('room_password');
                dispatchRoomState({ type: 'clear' });
                DeleteRoom(roomState?.code ?? '', authState.access_token ?? '')
                  .then(() => navigate('/'))
                  .catch((e) => console.log(e));
              }}
            >
              Delete
            </Button>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  );
}
