import { Box, Typography } from '@mui/joy'
import { useContext } from 'react'
import { InfoGrid } from '../components/display/info-grid'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'

export default function DebugPage() {
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)

  return (
    <Box display="flex" flexDirection="column" width="100%" marginLeft={2}>
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Room State:
      </Typography>
      <InfoGrid data={roomState ?? {}} />
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Auth State:
      </Typography>
      <InfoGrid data={authState} />
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Local Storage:
      </Typography>
      <InfoGrid
        data={{
          token: localStorage.getItem('token'),
          token_expiry: localStorage.getItem('token_expiry'),
          room_code: localStorage.getItem('room_code'),
          room_password: localStorage.getItem('room_password'),
          guest_id: localStorage.getItem('room_guest_id'),
          last_search: localStorage.getItem('last_search'),
          last_search_results: localStorage.getItem('last_search_results'),
          false: false,
          int: -12,
          float: 0,
          undefined: undefined,
        }}
      />
    </Box>
  )
}
