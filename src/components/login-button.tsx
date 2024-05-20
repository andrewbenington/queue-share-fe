import { ErrorOutline, PersonOffOutlined } from '@mui/icons-material'
import { Button, CircularProgress } from '@mui/joy'
import { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import useIsMobile from '../hooks/is_mobile'
import { AuthContext } from '../state/auth'

export function LoginButton() {
  const [authState] = useContext(AuthContext)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  if (authState.loading) {
    return (
      <Button
        variant="outlined"
        style={{
          padding: 5,
          margin: 5,
        }}
      >
        <CircularProgress size="sm" />
      </Button>
    )
  }

  return authState.error ? (
    <Button
      variant="outlined"
      onClick={() => navigate('/login')}
      style={{
        padding: 5,
        margin: 5,
      }}
      color="danger"
    >
      <ErrorOutline sx={{ mr: 0.5 }} />
      Log In
    </Button>
  ) : authState.username ? (
    <Button
      variant="outlined"
      style={{
        borderRadius: 5,
        padding: 5,
        margin: 5,
      }}
      onClick={() => navigate('/user')}
    >
      {authState.userSpotifyImageURL ? (
        <img
          style={{ borderRadius: 15, width: 30, height: 30, marginRight: 10 }}
          src={authState.userSpotifyImageURL}
        />
      ) : (
        <PersonOffOutlined />
      )}
      {isMobile ? <div /> : authState.userDisplayName}
    </Button>
  ) : (
    <Button
      variant="outlined"
      onClick={() => navigate('/login')}
      style={{
        padding: 5,
        margin: 5,
      }}
    >
      Log In
    </Button>
  )
}
