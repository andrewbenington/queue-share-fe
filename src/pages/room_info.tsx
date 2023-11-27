import {
  Backdrop,
  Checkbox,
  CircularProgress,
  Collapse,
  Fade,
  FormControlLabel,
  Modal,
  TextField,
  Typography,
} from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react';
import { Member } from '../components/member';
import { RoomCredentials } from '../service/auth';
import {
  AddRoomMember,
  GetRoomGuestsAndMembers,
  RoomGuest,
  RoomGuestsAndMembers,
  RoomMember,
} from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { authHasLoaded } from '../state/util';
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles';

export default function RoomInfoPage() {
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const [modalState, setModalState] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [guests, setGuests] = useState<RoomGuest[]>();
  const [members, setMembers] = useState<RoomMember[]>();
  const [username, setUsername] = useState('');
  const [addMemberModerator, setAddMemberModerator] = useState(false);

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        };
  }, [authState, roomState]);

  const update = (gm: RoomGuestsAndMembers) => {
    setGuests(gm.guests);
    setMembers(gm.members);
  };

  useEffect(() => {
    if (
      (guests === undefined || members === undefined) &&
      roomState &&
      authHasLoaded(authState)
    ) {
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
  }, [guests, members, roomState, authState]);

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
        setGuestsAndMembers={update}
      />
      {members?.map((member) => (
        <Member
          id={member.user_id}
          name={member.display_name}
          image={member.spotify_image}
          songs={member.queued_tracks}
          label={member.is_moderator ? 'Moderator' : 'Member'}
          setGuestsAndMembers={update}
        />
      ))}
      {roomState?.userIsModerator && (
        <StyledButton
          variant="outlined"
          onClick={() => setModalState('add_member')}
        >
          Add Member
        </StyledButton>
      )}
      <Typography fontWeight="bold">Guests</Typography>
      {guests?.map((guest) => (
        <Member
          id={guest.id}
          name={guest.name}
          songs={guest.queued_tracks}
          label="Guest"
          setGuestsAndMembers={update}
        />
      ))}
      <Modal
        open={modalState === 'add_member'}
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
        <Fade in={modalState === 'add_member'}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <TextField
              variant="outlined"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <FormControlLabel
              control={<Checkbox />}
              label="Set Moderator"
              value={addMemberModerator}
              onChange={(e) =>
                setAddMemberModerator(
                  (e as ChangeEvent<HTMLInputElement>).target.checked
                )
              }
              style={{ marginBottom: 10 }}
            />
            <StyledButton
              onClick={() => {
                if (!roomState || !authState.access_token) {
                  return;
                }
                AddRoomMember(
                  roomState.code,
                  authState.access_token,
                  username,
                  addMemberModerator
                ).then((res) => {
                  if (res && 'error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    });
                    return;
                  }
                  update(res);
                  enqueueSnackbar('User added successfully', {
                    variant: 'success',
                    autoHideDuration: 3000,
                  });
                  setModalState(undefined);
                });
              }}
              variant="contained"
            >
              Add
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </div>
  );
}
