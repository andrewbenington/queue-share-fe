import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';
import { RoundedRectangle } from './styles';

export default function DebugPage() {
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle style={{ width: 300 }}>
        <Typography fontStyle="bold">Room State:</Typography>
        <Typography>Code: {roomState?.code}</Typography>
        <Typography>Name: {roomState?.name}</Typography>
        <Typography>
          Host: {JSON.stringify(roomState?.host, undefined, ' ')}
        </Typography>
        <Typography>Guest name: {roomState?.guestName}</Typography>
        <Typography sx={{ mb: 1 }} fontStyle="bold">
          Auth State:
        </Typography>
        <Typography>Username: {authState.username}</Typography>
        <Typography>Display: {authState.userDisplayName}</Typography>
        <Typography>Guest ID: {authState.guestID}</Typography>
        <Typography>Loading: {authState.loading}</Typography>
        <Typography>Error: {authState.error}</Typography>
      </RoundedRectangle>
    </Box>
  );
}
