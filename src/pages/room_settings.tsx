import { Box, Button, Card, Input, Modal, Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteRoom, UpdateRoomPassword } from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { ModalContainerStyle } from './styles'

export default function RoomSettingsPage() {
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [modalState, setModalState] = useState<string>()
  const [password, setPassword] = useState('')
  const [passwordVerify, setPasswordVerify] = useState('')
  const navigate = useNavigate()

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <Card>
        <Button onClick={() => setModalState('update_password')} sx={{ mb: 2 }}>
          Update Password
        </Button>
        <Button onClick={() => setModalState('delete')} color="danger">
          Delete Room
        </Button>
      </Card>
      <Modal
        open={modalState === 'delete'}
        onClose={() => setModalState(undefined)}
        // slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Card sx={ModalContainerStyle}>
          <Typography mb={1}>Delete room?</Typography>
          <Button
            color="danger"
            style={{ marginBottom: 10 }}
            onClick={() => {
              localStorage.removeItem('room_code')
              localStorage.removeItem('room_password')
              dispatchRoomState({ type: 'clear' })
              DeleteRoom(roomState?.code ?? '', authState.access_token ?? '')
                .then(() => navigate('/'))
                .catch((e) => console.error(e))
            }}
          >
            Delete
          </Button>
          <Button variant="outlined" onClick={() => setModalState(undefined)}>
            Cancel
          </Button>
        </Card>
      </Modal>
      <Modal
        open={modalState === 'update_password'}
        onClose={() => setModalState(undefined)}
        // slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Card sx={ModalContainerStyle}>
          <Input
            placeholder="New Room Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            style={{ marginBottom: 10 }}
          />
          <Input
            placeholder="Confirm New Room Password"
            value={passwordVerify}
            onChange={(e) => setPasswordVerify(e.target.value)}
            type="password"
            style={{ marginBottom: 10 }}
          />
          <Button
            onClick={() => {
              if (!roomState || !authState.access_token) {
                return
              }
              UpdateRoomPassword(roomState.code, authState.access_token, password).then((res) => {
                if (res && 'error' in res) {
                  enqueueSnackbar(res.error, {
                    variant: 'error',
                    autoHideDuration: 3000,
                  })
                  return
                }
                enqueueSnackbar('Password updated successfully', {
                  variant: 'success',
                  autoHideDuration: 3000,
                })
                setModalState(undefined)
              })
            }}
          >
            Save
          </Button>
        </Card>
      </Modal>
    </Box>
  )
}
