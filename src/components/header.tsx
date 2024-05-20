import { ArrowBack } from '@mui/icons-material'
import { Box, Grid, IconButton, Sheet, Typography } from '@mui/joy'
import { useContext, useEffect, useState } from 'react'
import { Link, Route, Routes, useNavigate } from 'react-router-dom'
import { RoomContext } from '../state/room'
import FriendSelect from './friends/friend-select'
import { FriendPanel } from './friends/friend-suggestions'
import { LoginButton } from './login-button'

function Header() {
  const navigate = useNavigate()
  const [roomState] = useContext(RoomContext)
  const [width, setWidth] = useState<number>(window.innerWidth)
  const onBackClick = () => {
    if (window.location.pathname.startsWith('/stats')) {
      history.back()
    } else {
      navigate('/')
    }
  }

  function handleWindowSizeChange() {
    setWidth(window.innerWidth)
  }
  useEffect(() => {
    window.addEventListener('resize', handleWindowSizeChange)
    return () => {
      window.removeEventListener('resize', handleWindowSizeChange)
    }
  }, [])

  const isMobile = width <= 768

  return (
    <Sheet style={{ height: 60, padding: 5 }}>
      <Grid container alignItems="center" style={{ height: '100%' }}>
        <Grid xs={isMobile ? 2 : 4}>
          <Routes>
            <Route path="/" element={<div />} />
            <Route
              path="*"
              element={
                <IconButton onClick={onBackClick}>
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
              <Grid xs={isMobile ? 6 : 4}>
                {roomState ? (
                  <Typography
                    textAlign="center"
                    fontWeight="bold"
                    fontSize={24}
                    onClick={onBackClick}
                    style={{
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {roomState.name} - {roomState?.code}
                  </Typography>
                ) : (
                  <Typography textAlign="center" fontWeight="bold" fontSize={24}>
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
                  {roomState?.userIsHost ? (
                    <Typography textAlign="center" sx={{ mr: 1 }}>
                      You are the host
                    </Typography>
                  ) : (
                    <Typography textAlign="center" sx={{ mr: 1 }}>
                      Host: {roomState?.host?.userDisplayName}
                    </Typography>
                  )}
                  {roomState && roomState.guestName && (
                    <Typography textAlign="center">- Joined as {roomState.guestName}</Typography>
                  )}
                </div>
              </Grid>
            }
          />
          <Route
            path="stats/*"
            element={
              <Grid
                xs={isMobile ? 6 : 4}
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isMobile ? (
                  <div />
                ) : (
                  <>
                    {' '}
                    <Link to="/">
                      <Typography
                        textAlign="center"
                        fontWeight="bold"
                        fontSize={24}
                        marginRight={1}
                      >
                        Queue Share:
                      </Typography>
                    </Link>
                    <Typography textAlign="center" fontWeight="bold" fontSize={24} marginRight={1}>
                      Streaming Stats
                    </Typography>
                  </>
                )}
                <FriendSelect />
              </Grid>
            }
          />
          <Route
            path="*"
            element={
              <Grid xs={isMobile ? 6 : 4}>
                <Typography textAlign="center" fontWeight="bold" fontSize={24}>
                  Queue Share
                </Typography>
              </Grid>
            }
          />
        </Routes>

        <Grid xs={4}>
          <Routes>
            <Route
              path="*"
              element={
                <Box display="flex" justifyContent="flex-end">
                  <FriendPanel />
                  <LoginButton />
                </Box>
              }
            />
            <Route path="/login" element={<div />} />
          </Routes>
        </Grid>
      </Grid>
    </Sheet>
  )
}

export default Header
