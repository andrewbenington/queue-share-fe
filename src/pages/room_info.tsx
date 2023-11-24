import {
  Box,
  CircularProgress,
  Collapse,
  Fade,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useMemo, useState } from 'react';
import { GetRoomGuestsAndMembers } from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';
import { RoundedRectangle } from './styles';
import { RoomCredentials } from '../service/auth';
import { UserResponseWithSpotify } from '../service/user';

interface Guest {
  id: string;
  name: string;
}

export default function RoomInfoPage() {
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<Guest[]>();
  const [members, setMembers] = useState<UserResponseWithSpotify[]>();

  const roomCredentials: RoomCredentials = useMemo(() => {
    return roomState?.userIsHost
      ? { token: authState.access_token ?? '' }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  useEffect(() => {
    if (roomState && guests === undefined && authHasLoaded(authState)) {
      setLoading(true);
      GetRoomGuestsAndMembers(roomState.code, roomCredentials).then((res) => {
        setLoading(false);
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
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      <RoundedRectangle>
        <Typography variant="h5">Members</Typography>
        {members?.map((member) => (
          <div style={{ borderBottom: 2, borderColor: 'white' }}>
            <Typography>{member.display_name}</Typography>
          </div>
        ))}
        <Typography variant="h5">Guests</Typography>
        {guests?.map((guest) => (
          <div style={{ borderBottom: 2, borderColor: 'white' }}>
            <Typography>{guest.name}</Typography>
          </div>
        ))}
      </RoundedRectangle>
    </Box>
  );
}
