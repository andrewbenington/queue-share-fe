import { Box, Typography } from '@mui/material';
import { useContext } from 'react';
import { RedirectSpotifyLogin } from '../service/spotify';
import { AuthContext } from '../state/auth';
import { RoundedRectangle, StyledButton } from './styles';
import { useNavigate } from 'react-router-dom';
import { Person } from '@mui/icons-material';

function UserPage() {
  const [authState, dispatchAuthState] = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle style={{ width: 300 }}>
        <Typography fontWeight="bold">Username:</Typography>
        <Typography sx={{ mb: 1 }}>{authState.username}</Typography>
        <Typography fontWeight="bold">Display Name:</Typography>
        <Typography sx={{ mb: 1 }}>{authState.userDisplayName}</Typography>
        {authState.access_token && !authState.userSpotifyAccount ? (
          <StyledButton
            variant="outlined"
            onClick={() =>
              authState.access_token &&
              RedirectSpotifyLogin(authState.access_token)
            }
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
            sx={{ mb: 2, p: 1 }}
          >
            <img
              src="/Spotify_Logo_RGB_White.png"
              alt="spotify logo"
              height={30}
            />
            :
            <Box
              display="flex"
              alignItems="center"
              justifyContent="end"
              flex={1}
            >
              {authState.userSpotifyImageURL &&
              authState.userSpotifyImageURL !== '' ? (
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
        <StyledButton
          variant="outlined"
          color="error"
          onClick={() => {
            dispatchAuthState({ type: 'logout' });
            navigate('/');
          }}
        >
          Log Out
        </StyledButton>
      </RoundedRectangle>
    </Box>
  );
}

export default UserPage;
