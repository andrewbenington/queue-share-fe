import { Backdrop, Box, Button, Fade, Modal, TextField, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DeleteRoom, UpdateRoomPassword } from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles'

export default function RoomSettingsPage() {
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [modalState, setModalState] = useState<string>()
  const [password, setPassword] = useState('')
  const [passwordVerify, setPasswordVerify] = useState('')
  const navigate = useNavigate()

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle>
        <StyledButton
          onClick={() => setModalState('update_password')}
          variant="contained"
          sx={{ mb: 2 }}
        >
          Update Password
        </StyledButton>
        <StyledButton onClick={() => setModalState('delete')} variant="contained" color="error">
          Delete Room
        </StyledButton>
      </RoundedRectangle>
      <Modal
        open={modalState === 'delete'}
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
        <Fade in={modalState === 'delete'}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <Typography mb={1}>Delete room?</Typography>
            <Button
              variant="contained"
              color="error"
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
          </RoundedRectangle>
        </Fade>
      </Modal>
      <Modal
        open={modalState === 'update_password'}
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
        <Fade in={!!modalState}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <TextField
              variant="outlined"
              label="New Room Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <TextField
              variant="outlined"
              label="Confirm New Room Password"
              value={passwordVerify}
              onChange={(e) => setPasswordVerify(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <StyledButton
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
              variant="contained"
            >
              Save
            </StyledButton>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  )
}
