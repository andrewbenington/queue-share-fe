import { Person } from '@mui/icons-material'
import { Alert, Backdrop, Box, Button, Fade, Modal, Typography } from '@mui/material'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { RedirectSpotifyLogin } from '../service/spotify'
import { UnlinkSpotify } from '../service/user'
import { AuthContext } from '../state/auth'
import { ModalContainerStyle, RoundedRectangle, StyledButton } from './styles'

function UserPage() {
  const [authState, dispatchAuthState] = useContext(AuthContext)
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle style={{ width: 300 }}>
        {params.get('create_room') && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Link a Spotify account to create a room.
          </Alert>
        )}
        <Typography fontWeight="bold">Username:</Typography>
        <Typography sx={{ mb: 1 }}>{authState.username}</Typography>
        <Typography fontWeight="bold">Display Name:</Typography>
        <Typography sx={{ mb: 1 }}>{authState.userDisplayName}</Typography>
        {authState.access_token && !authState.userSpotifyAccount ? (
          <StyledButton
            variant="outlined"
            onClick={() => authState.access_token && RedirectSpotifyLogin(authState.access_token)}
            style={{
              backgroundColor: '#1DB954',
              color: 'white',
              borderColor: 'white',
            }}
            sx={{ mb: 1 }}
          >
            <img
              src="/Spotify_Icon_RGB_White.png"
              alt="spotify logo"
              width={30}
              height={30}
              style={{ marginRight: 10 }}
            />
            Link Spotify
          </StyledButton>
        ) : authState.userSpotifyAccount ? (
          <Box
            display="flex"
            style={{ backgroundColor: '#1DB954' }}
            borderRadius={1}
            sx={{ mb: 1, p: 1 }}
          >
            <img src="/Spotify_Logo_RGB_White.png" alt="spotify logo" height={30} />:
            <Box display="flex" alignItems="center" justifyContent="end" flex={1}>
              {authState.userSpotifyImageURL && authState.userSpotifyImageURL !== '' ? (
                <img
                  style={{
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    marginRight: 10,
                  }}
                  src={authState.userSpotifyImageURL}
                />
              ) : (
                <Person
                  fontSize="small"
                  style={{
                    borderRadius: 15,
                    width: 30,
                    height: 30,
                    marginRight: 10,
                    backgroundColor: '#999',
                  }}
                />
              )}
              {authState.userSpotifyAccount}
            </Box>
          </Box>
        ) : (
          <div />
        )}
        {authState.userSpotifyAccount && (
          <StyledButton
            variant="outlined"
            color="error"
            onClick={() => setModalOpen(true)}
            sx={{ mb: 2 }}
          >
            Unlink Spotify Account
          </StyledButton>
        )}
        <StyledButton
          variant="outlined"
          color="error"
          onClick={() => {
            dispatchAuthState({ type: 'logout' })
            navigate('/')
          }}
        >
          Log Out
        </StyledButton>
      </RoundedRectangle>
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
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
        <Fade in={modalOpen}>
          <RoundedRectangle sx={ModalContainerStyle}>
            <Typography mb={1}>Unlink Spotify account?</Typography>
            <Button
              variant="contained"
              color="error"
              style={{ marginBottom: 10 }}
              onClick={() => {
                UnlinkSpotify(authState.access_token ?? '').then((res) => {
                  if (res && 'error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    })
                    return
                  }
                  dispatchAuthState({ type: 'unlink_spotify' })
                  setModalOpen(false)
                })
              }}
            >
              Unlink
            </Button>
            <Button variant="outlined" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
          </RoundedRectangle>
        </Fade>
      </Modal>
    </Box>
  )
}

export default UserPage
