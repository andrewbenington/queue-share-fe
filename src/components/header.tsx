import { ArrowBack } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { useContext, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { RoomContext } from '../state/room';
import { LoginButton } from './login_button';

function Header() {
  const navigate = useNavigate();
  const [roomState] = useContext(RoomContext);
  const [width, setWidth] = useState<number>(window.innerWidth);

  const navigateHome = () => {
    navigate('/');
  };

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

  return (
    <Paper square style={{ height: 52, padding: 5 }}>
      <Grid container alignItems="center" style={{ height: '100%' }}>
        <Grid item xs={isMobile ? 2 : 3}>
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
              <Grid item xs={isMobile ? 8 : 6}>
                {roomState ? (
                  <Typography
                    align="center"
                    fontWeight="bold"
                    fontSize={24}
                    onClick={navigateHome}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {roomState.name} - Hosted by{' '}
                    {roomState.host?.userDisplayName}
                  </Typography>
                ) : (
                  <Typography align="center" fontWeight="bold" fontSize={24}>
                    Queue Share
                  </Typography>
                )}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'center',
                  }}
                >
                  <Typography align="center" sx={{ mr: 1 }}>
                    Code: {roomState?.code} -
                  </Typography>
                  {roomState && roomState.guestName ? (
                    <Typography align="center">
                      Joined as {roomState.guestName}
                    </Typography>
                  ) : roomState && roomState.userIsHost ? (
                    <Typography align="center">You are the host</Typography>
                  ) : (
                    <div />
                  )}
                </div>
              </Grid>
            }
          />
          <Route
            path="*"
            element={
              <Grid item xs={isMobile ? 8 : 6}>
                <Typography align="center" fontWeight="bold" fontSize={24}>
                  Queue Share
                </Typography>
              </Grid>
            }
          />
        </Routes>
        <Grid item xs={isMobile ? 2 : 3}>
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
