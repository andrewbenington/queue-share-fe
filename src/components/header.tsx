import { ArrowBack } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { RoomContext } from '../state/room';
import { LoginButton } from './login_button';

function Header() {
  const navigate = useNavigate();
  const [roomState, dispatchRoomState] = useContext(RoomContext);

  const navigateHome = () => {
    if (roomState.code) {
      dispatchRoomState({ type: 'clear' });
    }
    navigate('/');
  };

  return (
    <Paper square style={{ padding: 5 }}>
      <Grid container alignItems="center">
        <Grid item xs={3}>
          <Routes>
            <Route path="/" element={<div />} />
            <Route
              path="*"
              element={
                <IconButton onClick={navigateHome}>
                  <ArrowBack />
                </IconButton>
              }
            />
          </Routes>
        </Grid>
        <Routes>
          <Route
            path="/room/*"
            element={
              <Grid item xs={6}>
                <Typography
                  align="center"
                  fontWeight="bold"
                  fontSize={24}
                  onClick={navigateHome}
                >
                  {roomState.name}
                </Typography>
                <Typography align="center">
                  Hosted by {roomState.host?.userDisplayName}
                </Typography>
              </Grid>
            }
          />
          <Route
            path="*"
            element={
              <Grid item xs={6}>
                <Typography align="center" fontWeight="bold" fontSize={24}>
                  Queue Share
                </Typography>
              </Grid>
            }
          />
        </Routes>
        <Grid item xs={3}>
          <Routes>
            <Route
              path="*"
              element={
                <Box display="flex" justifyContent="flex-end">
                  <LoginButton />
                </Box>
              }
            />
            <Route path="/login" element={<div />} />
          </Routes>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default Header;
