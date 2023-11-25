import { Box } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RoomCredentials } from '../service/auth';
import { DeleteRoom, GetRoomGuestsAndMembers } from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';
import { RoundedRectangle, StyledButton } from './styles';
import { UserResponseWithSpotify } from '../service/user';

interface Guest {
  id: string;
  name: string;
}

export default function RoomSettingsPage() {
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [guests, setGuests] = useState<Guest[]>();
  const [, setMembers] = useState<UserResponseWithSpotify[]>();
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
          onClick={() =>
            DeleteRoom(roomState?.code ?? '', authState.access_token ?? '')
              .then(() => navigate('/'))
              .catch((e) => console.log(e))
          }
          variant="contained"
          color="error"
        >
          Delete Room
        </StyledButton>
      </RoundedRectangle>
    </Box>
  );
}
