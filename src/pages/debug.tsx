import { Box, Typography, useTheme } from '@mui/material'
import { useContext } from 'react'
import { JSONTree } from 'react-json-tree'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'

export default function DebugPage() {
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const theme = useTheme()

  const jsonTheme = {
    base00: '#0000',
    base01: '#383830',
    base02: '#49483e',
    base03: theme.palette.background.paper, // number of keys
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: theme.palette.warning.main, // null/undefined
    base09: theme.palette.primary.main, // true/false/numbers
    base0A: '#f4bf75',
    base0B: theme.palette.text.primary, // strings
    base0C: '#a1efe4',
    base0D: '#66d9ef', // keys
    base0E: '#ae81ff',
    base0F: '#cc6633',
  }

  return (
    <Box display="flex" flexDirection="column" width="100%" marginLeft={2}>
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Room State:
      </Typography>
      <JSONTree theme={jsonTheme} data={roomState} invertTheme={false} />
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Auth State:
      </Typography>
      <JSONTree theme={jsonTheme} data={authState} />
      <Typography marginTop={3} fontWeight="bold" fontSize={20}>
        Local Storage:
      </Typography>
      <JSONTree
        theme={jsonTheme}
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
