import { Box, CssVarsProvider, extendTheme } from '@mui/joy'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import { SnackbarProvider } from 'notistack'
import { useMemo } from 'react'
import { Route, Routes } from 'react-router-dom'
import Header from './components/header'
import useIsDarkMode from './hooks/dark_mode'
import HomePage from './pages/home'
import LoginPage from './pages/login'
import RoomPage from './pages/room'
import StatsPage from './pages/stats/stats'
import UserPage from './pages/user'
import { AuthProvider } from './state/auth'
import { StatFriendProvider } from './state/friend_stats'
import RoomProvider from './state/room'
import { components, darkTheme, lightTheme } from './themes'

function App() {
  const isDarkMode = useIsDarkMode()
  const theme = useMemo(
    () =>
      extendTheme({
        colorSchemes: {
          dark: isDarkMode ? darkTheme : lightTheme,
          light: isDarkMode ? darkTheme : lightTheme,
        },
        components,
      }),
    [isDarkMode, darkTheme, lightTheme, components]
  )

  dayjs.extend(utc)
  dayjs.extend(timezone)

  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={3} preventDuplicate>
        <RoomProvider>
          <StatFriendProvider>
            <CssVarsProvider theme={theme} defaultMode="system">
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
                  overflow="hidden"
                  // width="1005"
                >
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/stats/*" element={<StatsPage />} />
                    <Route path="/spotify-redirect" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/user" element={<UserPage />} />
                    <Route path="/room/:room" element={<RoomPage />} />
                  </Routes>
                </Box>
              </Box>
            </CssVarsProvider>
          </StatFriendProvider>
        </RoomProvider>
      </SnackbarProvider>
    </AuthProvider>
  )
}

export default App
