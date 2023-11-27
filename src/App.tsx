import { Box, ThemeProvider, createTheme } from '@mui/material';
import { SnackbarProvider } from 'notistack';
import { Route, Routes } from 'react-router-dom';
import Header from './components/header';
import HomePage from './pages/home';
import LoginPage from './pages/login';
import RoomPage from './pages/room';
import UserPage from './pages/user';
import { AuthProvider } from './state/auth';
import RoomProvider from './state/room';

function App() {
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
      text: { primary: '#fff', secondary: '#fff' },
    },
    typography: {
      allVariants: {
        color: '#fff',
      },
    },
  });

  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={3}>
        <RoomProvider>
          <ThemeProvider theme={theme}>
            <Box
              style={{ width: '100%' }}
              display="flex"
              flexDirection="column"
              overflow="hidden"
            >
              <Header />
              <Box
                display="flex"
                flex={1}
                justifyContent="center"
                position="relative"
                width="1005"
              >
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/spotify-redirect" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/user" element={<UserPage />} />
                  <Route path="/room/:room" element={<RoomPage />} />
                </Routes>
              </Box>
            </Box>
          </ThemeProvider>
        </RoomProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
