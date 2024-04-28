import { Box, ThemeProvider, createTheme } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { useMemo } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "./components/header";
import useIsDarkMode from "./hooks/dark_mode";
import HomePage from "./pages/home";
import LoginPage from "./pages/login";
import RoomPage from "./pages/room";
import StatsPage from "./pages/stats/stats";
import UserPage from "./pages/user";
import { AuthProvider } from "./state/auth";
import RoomProvider from "./state/room";
import { darkTheme, lightTheme } from "./themes";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

function App() {
  const isDarkMode = useIsDarkMode();
  const theme = useMemo(
    () => createTheme(isDarkMode ? darkTheme : lightTheme),
    [isDarkMode]
  );

  dayjs.extend(utc);
  dayjs.extend(timezone);

  return (
    <AuthProvider>
      <SnackbarProvider maxSnack={3}>
        <RoomProvider>
          <ThemeProvider theme={theme}>
            <Box
              style={{ width: "100%" }}
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
          </ThemeProvider>
        </RoomProvider>
      </SnackbarProvider>
    </AuthProvider>
  );
}

export default App;
