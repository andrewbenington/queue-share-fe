import { ArrowBack, PersonAdd } from '@mui/icons-material'
import { Box, Grid, IconButton, Menu, Paper, Typography } from '@mui/material'
import { useContext, useEffect, useState } from 'react'
import { Route, Routes, useNavigate } from 'react-router-dom'
import { RoomContext } from '../state/room'
import { LoginButton } from './login-button'
import { FriendPanel } from './friends/friend-suggestions'

function Header() {
  const navigate = useNavigate()
  const [roomState] = useContext(RoomContext)
  const [width, setWidth] = useState<number>(window.innerWidth)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const menuOpen = !!anchorEl

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }

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
    <Paper square style={{ height: 60, padding: 5 }}>
      <Grid container alignItems="center" style={{ height: '100%' }}>
        <Grid item xs={isMobile ? 2 : 3}>
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
              <Grid item xs={isMobile ? 8 : 6}>
                {roomState ? (
                  <Typography
                    align="center"
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
                  {roomState?.userIsHost ? (
                    <Typography align="center" sx={{ mr: 1 }}>
                      You are the host
                    </Typography>
                  ) : (
                    <Typography align="center" sx={{ mr: 1 }}>
                      Host: {roomState?.host?.userDisplayName}
                    </Typography>
                  )}
                  {roomState && roomState.guestName && (
                    <Typography align="center">- Joined as {roomState.guestName}</Typography>
                  )}
                </div>
              </Grid>
            }
          />
          <Route
            path="stats/*"
            element={
              <Grid item xs={isMobile ? 8 : 6}>
                <Typography align="center" fontWeight="bold" fontSize={24}>
                  Spotify Stats
                </Typography>
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
                  <IconButton
                    id="basic-button"
                    aria-controls={menuOpen ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={menuOpen ? 'true' : undefined}
                    onClick={handleClick}
                  >
                    <PersonAdd />
                  </IconButton>
                  <Menu
                    id="basic-menu"
                    anchorEl={anchorEl}
                    open={menuOpen}
                    onClose={handleClose}
                    MenuListProps={{
                      'aria-labelledby': 'basic-button',
                    }}
                    anchorOrigin={{ horizontal: -240, vertical: 'bottom' }}
                  >
                    <FriendPanel />
                  </Menu>
                  <LoginButton />
                </Box>
              }
            />
            <Route path="/login" element={<div />} />
          </Routes>
        </Grid>
      </Grid>
    </Paper>
  )
}

export default Header
