import { ArrowBack } from '@mui/icons-material';
import { Box, Grid, IconButton, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import RoomContext from '../state/room';
import { LoginButton } from './login_button';

function Header(props: { resetRoom: () => void }) {
  const { resetRoom } = props;
  const roomState = useContext(RoomContext);
  const navigate = useNavigate();
  return (
    <Paper square style={{ padding: 5 }}>
      <Grid container alignItems="center">
        <Grid item xs={3}>
          {roomState ? (
            <IconButton
              onClick={() => {
                resetRoom();
                navigate('/');
              }}
            >
              <ArrowBack />
            </IconButton>
          ) : (
            <div />
          )}
        </Grid>
        <Grid item xs={6}>
          <Typography
            align="center"
            fontWeight="bold"
            fontSize={24}
            onClick={() => {
              roomState || resetRoom();
              roomState || navigate('/');
            }}
          >
            {roomState ? roomState.name : 'Queue Share'}
          </Typography>
          {roomState ? (
            <Typography align="center">Hosted by {roomState.host}</Typography>
          ) : (
            <div />
          )}
        </Grid>
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
