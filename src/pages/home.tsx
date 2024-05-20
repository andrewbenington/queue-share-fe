import { Box, Button, Card, Input, Modal, ModalDialog, Stack, Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LoadingButton from '../components/loading-button'
import { RoomPreview } from '../components/room-preview'
import { CreateRoom } from '../service/room'
import { GetUserHistoryStatus, UploadHistory } from '../service/stats'
import { CurrentUserHostedRooms, CurrentUserJoinedRooms, RoomsResponse } from '../service/user'
import { AuthContext, UserOnlyContent } from '../state/auth'
import { RoomContext } from '../state/room'
import { ModalContainerStyle } from './styles'

function HomePage() {
  const [modalState, setModalState] = useState<string>()
  const [roomName, setRoomName] = useState('')
  const [roomCode, setRoomCode] = useState('')
  const [hostedRooms, setHostedRooms] = useState<RoomsResponse>()
  const [joinedRooms, setJoinedRooms] = useState<RoomsResponse>()
  const [loading, setLoading] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordVerify, setPasswordVerify] = useState('')
  const navigate = useNavigate()
  const [authState] = useContext(AuthContext)
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [userHasHistory, setUserHasHistory] = useState<boolean>()
  const inputFile = useRef<HTMLInputElement>(null)

  const checkUserHistoryData = useCallback(async () => {
    if (!authState.access_token) return
    const response = await GetUserHistoryStatus(authState.access_token)
    if ('error' in response) {
      enqueueSnackbar(response.error, {
        variant: 'error',
        autoHideDuration: 3000,
      })
      return
    }
    setUserHasHistory(response.user_has_history)
  }, [authState])

  const uploadUserHistory = async () => {
    if (!authState.access_token || !inputFile.current?.files?.length) return
    const response = await UploadHistory(authState.access_token, inputFile.current?.files[0])
    if (response && 'error' in response) {
      enqueueSnackbar(response.error, {
        variant: 'error',
        autoHideDuration: 3000,
      })
      return
    }
    navigate('stats/year-tree')
  }

  useEffect(() => {
    if (!authState.access_token || userHasHistory !== undefined) return
    checkUserHistoryData()
  }, [authState, userHasHistory])

  useEffect(() => {
    document.title = 'Queue Share'
    dispatchRoomState({ type: 'clear' })
  })

  useEffect(() => {
    if (authState.access_token && !hostedRooms && !loading) {
      setLoading(true)
      CurrentUserHostedRooms(authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        }
        setHostedRooms(res)
      })
    }
  }, [authState, hostedRooms, loading])

  useEffect(() => {
    if (authState.access_token && !joinedRooms && !loading) {
      setLoading(true)
      CurrentUserJoinedRooms(authState.access_token).then((res) => {
        if ('error' in res) {
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        }
        setJoinedRooms(res)
      })
    }
  }, [authState, joinedRooms, loading])

  const joinRoom = () => {
    localStorage.setItem('room_password', password)
    navigate(`/room/${roomCode}`)
  }

  const createRoom = () => {
    if (!authState.access_token) {
      navigate(`/login`)
      return
    }
    if (!authState.userSpotifyAccount) {
      enqueueSnackbar('Link a Spotify account to create a room', {
        variant: 'warning',
      })
      navigate(`/user`)
    }
    CreateRoom(roomName, password, authState.access_token).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, { variant: 'error' })
        return
      }
      const room = res.room
      dispatchRoomState({
        type: 'join',
        payload: {
          name: room.name,
          host: {
            username: room.host.username,
            userDisplayName: room.host.display_name,
            userSpotifyAccount: room.host.spotify_name,
            userSpotifyImageURL: room.host.spotify_image,
          },
          code: room.code,
          userIsHost: true,
        },
      })
      navigate(`/room/${room.code}`)
    })
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      width={360}
    >
      <Stack>
        <Card sx={{ mb: 3 }}>
          <Button style={{ marginBottom: 10 }} onClick={() => setModalState('join')}>
            Enter Room Code
          </Button>
          {!authState.access_token && localStorage.getItem('room_code') && (
            <Button
              style={{ marginBottom: 10 }}
              onClick={() => {
                navigate(`/room/${roomState?.code ?? localStorage.getItem('room_code')}`)
              }}
            >
              Rejoin "{roomState?.name ?? localStorage.getItem('room_code')}"
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() =>
              authState?.access_token
                ? setModalState('create')
                : navigate('/login?create_room=true')
            }
          >
            Create Room
          </Button>
        </Card>
        {hostedRooms && hostedRooms.rooms.length > 0 && (
          <Box width="100%">
            <Typography fontWeight="bold" textAlign="left" marginBottom={1}>
              Hosted Rooms
            </Typography>
            {hostedRooms.rooms.map((room) => (
              <RoomPreview room={room} />
            ))}
          </Box>
        )}
        {joinedRooms && joinedRooms.rooms.length > 0 && (
          <Box width="100%">
            <Typography fontWeight="bold" marginBottom={1}>
              Joined Rooms
            </Typography>
            {joinedRooms.rooms.map((room) => (
              <RoomPreview room={room} />
            ))}
          </Box>
        )}
        <UserOnlyContent>
          {userHasHistory ? (
            <Link to="/stats/songs-by-month">
              <Button fullWidth>View Streaming Stats</Button>
            </Link>
          ) : (
            <div>
              <Typography fontWeight="bold" textAlign="left" marginBottom={1}>
                Upload Spotify History .zip File
              </Typography>
              <Card>
                <Stack>
                  <input type="file" id="file" ref={inputFile} />
                  <LoadingButton variant="outlined" onClickAsync={uploadUserHistory}>
                    Submit
                  </LoadingButton>
                </Stack>
              </Card>
            </div>
          )}
        </UserOnlyContent>
      </Stack>
      <Modal open={modalState === 'join'} onClose={() => setModalState(undefined)}>
        <ModalDialog
        // slots={{ backdrop: Backdrop }}
        // slotProps={{
        //   backdrop: {
        //     timeout: 500,
        //   },
        // }}
        >
          <Card sx={ModalContainerStyle}>
            <Input
              placeholder="Room Code"
              value={roomCode}
              autoComplete="off"
              onChange={(e) => setRoomCode(e.target.value.toLocaleUpperCase())}
              style={{ marginBottom: 10 }}
            />
            <Button onClick={joinRoom}>Join</Button>
          </Card>
        </ModalDialog>
      </Modal>
      <Modal
        open={modalState === 'create'}
        onClose={() => setModalState(undefined)}
        // slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <ModalDialog>
          <Card>
            <Input
              placeholder="Room Name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              style={{ marginBottom: 10 }}
            />
            <Input
              placeholder="Room Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <Input
              placeholder="Confirm Room Password"
              value={passwordVerify}
              onChange={(e) => setPasswordVerify(e.target.value)}
              type="password"
              style={{ marginBottom: 10 }}
            />
            <Button onClick={createRoom}>Create</Button>
          </Card>
        </ModalDialog>
      </Modal>
    </Box>
  )
}

export default HomePage
