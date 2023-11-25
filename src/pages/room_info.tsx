import { CircularProgress, Collapse, Fade, Typography } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useEffect, useMemo, useState } from 'react';
import { Member } from '../components/member';
import { RoomCredentials } from '../service/auth';
import {
  GetRoomGuestsAndMembers,
  RoomGuest,
  RoomMember,
} from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';

export default function RoomInfoPage() {
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<RoomGuest[]>();
  const [members, setMembers] = useState<RoomMember[]>();

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  const loadMembers = () => {
    if (roomState && authHasLoaded(authState)) {
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
  };

  useEffect(() => {
    if (guests === undefined) {
      loadMembers();
    }
  }, [guests, roomState, authState]);

  return (
    <div style={{ width: 'inherit', marginTop: 8 }}>
      <Collapse
        in={loading}
        style={{ display: 'grid', justifyContent: 'center' }}
      >
        <Fade in={loading} style={{ margin: 10 }}>
          <CircularProgress />
        </Fade>
      </Collapse>
      <Typography fontWeight="bold">Members</Typography>
      <Member
        id={''}
        name={roomState?.host?.userDisplayName ?? ''}
        image={roomState?.host?.userSpotifyImageURL}
        songs={0}
        label="Host"
        reloadMembers={loadMembers}
      />
      {members?.map((member) => (
        <Member
          id={member.user_id}
          name={member.display_name}
          image={member.spotify_image}
          songs={member.queued_tracks}
          label={member.is_moderator ? 'Moderator' : 'Member'}
          reloadMembers={loadMembers}
        />
      ))}
      <Typography fontWeight="bold">Guests</Typography>
      {guests?.map((guest) => (
        <Member
          id={guest.id}
          name={guest.name}
          songs={guest.queued_tracks}
          label="Guest"
          reloadMembers={loadMembers}
        />
      ))}
    </div>
  );
}
