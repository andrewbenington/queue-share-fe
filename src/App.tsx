import { Box, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import Header from './components/header';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RoomPage from './pages/room';
import UserPage from './pages/user';
import { AuthProvider } from './state/auth';
import RoomContext, { RoomState } from './state/room';

function App() {
  const [roomState, setRoomState] = useState<RoomState | null>(null);
  const navigate = useNavigate();

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#e0e',
      },
      background: {
        default: '#000',
        paper: '#444',
      },
      text: { primary: '#fff' },
    },
  });

  const resetRoom = () => {
    setRoomState(null);
    navigate('/');
  };

  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={3}>
        <RoomContext.Provider value={roomState}>
          <ThemeProvider theme={theme}>
            <Box
              style={{ width: '100%' }}
              display="flex"
              flexDirection="column"
            >
              <Header resetRoom={resetRoom} />
              <Box display="flex" flex={1} justifyContent="center">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/spotify-redirect" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route
                    path="/:room"
                    element={<RoomPage setRoomState={setRoomState} />}
                  />
                </Routes>
              </Box>
            </Box>
          </ThemeProvider>
        </RoomContext.Provider>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
