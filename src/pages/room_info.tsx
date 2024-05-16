import { Box, CircularProgress, Collapse, Fade, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Member } from '../components/member'
import AddMemberModal from '../components/room_members/add_member_modal'
import { RoomCredentials } from '../service/auth'
import {
  GetRoomGuestsAndMembers,
  RoomGuest,
  RoomGuestsAndMembers,
  RoomMember,
} from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { authHasLoaded } from '../state/util'
import { StyledButton } from './styles'
import useIsMobile from '../hooks/is_mobile'

export default function RoomInfoPage() {
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [modalState, setModalState] = useState<string>()
  const [loading, setLoading] = useState(true)
  const [guests, setGuests] = useState<RoomGuest[]>()
  const [members, setMembers] = useState<RoomMember[]>()
  const isMobile = useIsMobile()

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        }
  }, [authState, roomState])

  const update = (gm: RoomGuestsAndMembers) => {
    setGuests(gm.guests)
    setMembers(gm.members)
  }

  useEffect(() => {
    if ((guests === undefined || members === undefined) && roomState && authHasLoaded(authState)) {
      GetRoomGuestsAndMembers(roomState.code, roomCredentials).then((res) => {
        setLoading(false)
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        }
        setGuests(res.guests)
        setMembers(res.members)
      })
    }
  }, [guests, members, roomState, authState])

  return (
    <Box width={isMobile ? '97%' : '100%'} mt={1}>
      <Collapse in={loading} style={{ display: 'grid', justifyContent: 'center' }}>
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
        <StyledButton variant="outlined" onClick={() => setModalState('add_member')} sx={{ mb: 1 }}>
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
      <AddMemberModal
        isOpen={modalState === 'add_member'}
        onClose={() => setModalState(undefined)}
        updateMembers={update}
      />
    </Box>
  )
}
