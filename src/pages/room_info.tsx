import { Box, Button, Stack, Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useMemo, useState } from 'react'
import CollapsingProgress from '../components/display/collapsing-progress'
import { Member } from '../components/member'
import AddMemberModal from '../components/room_members/add_member_modal'
import useIsMobile from '../hooks/is_mobile'
import { RoomCredentials } from '../service/auth'
import { GetRoomGuestsAndMembers, RoomGuest, RoomMember } from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { authHasLoaded } from '../state/util'

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

  const fetchData = () => {
    if (roomState && authHasLoaded(authState)) {
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
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <Box width={isMobile ? '97%' : '100%'} mt={1}>
      <CollapsingProgress loading={loading} />
      <Typography fontWeight="bold">Members</Typography>
      <Stack>
        <Member
          id={''}
          name={roomState?.host?.userDisplayName ?? ''}
          image={roomState?.host?.userSpotifyImageURL}
          songs={0}
          label="Host"
          refreshGuestsAndMembers={fetchData}
        />
        {members?.map((member) => (
          <Member
            id={member.id}
            name={member.display_name}
            image={member.spotify_image_url}
            songs={member.queued_tracks}
            label={member.is_moderator ? 'Moderator' : 'Member'}
            refreshGuestsAndMembers={fetchData}
          />
        ))}
        {roomState?.userIsModerator && (
          <Button onClick={() => setModalState('add_member')} sx={{ mb: 1 }}>
            Add Member
          </Button>
        )}
      </Stack>
      <Typography fontWeight="bold">Guests</Typography>
      {guests?.map((guest) => (
        <Member
          id={guest.id}
          name={guest.name}
          songs={guest.queued_tracks}
          label="Guest"
          refreshGuestsAndMembers={fetchData}
        />
      ))}
      <AddMemberModal
        isOpen={modalState === 'add_member'}
        onClose={() => setModalState(undefined)}
        updateMembers={fetchData}
      />
    </Box>
  )
}
