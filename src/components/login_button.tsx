import { ErrorOutline, PersonOffOutlined } from '@mui/icons-material';
import { Button, CircularProgress } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../state/auth';

export function LoginButton() {
  const [authState] = useContext(AuthContext);
  const navigate = useNavigate();
  const [width, setWidth] = useState<number>(window.innerWidth);

  function handleWindowSizeChange() {
    setWidth(window.innerWidth);
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange);
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange);
    };
  }, []);

  const isMobile = width <= 768;

  if (authState.loading) {
    return (
      <Button
        variant="outlined"
        style={{
          padding: 5,
          margin: 5,
        }}
      >
        <CircularProgress size={20} />
      </Button>
    );
  }

  return authState.error ? (
    <Button
      variant="outlined"
      onClick={() => navigate('/login')}
      style={{
        padding: 5,
        margin: 5,
      }}
      color="error"
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
  );
}
