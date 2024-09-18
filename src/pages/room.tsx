import {
  Box,
  Button,
  Card,
  ListItemDecorator,
  Modal,
  Tab,
  TabList,
  Tabs,
  Typography,
} from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MdAdd, MdBugReport, MdGroup, MdQueueMusic, MdSettings } from 'react-icons/md'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import GuestNameModal from '../components/room/guest_name_modal'
import PasswordModal from '../components/room/password_modal'
import useIsMobile from '../hooks/is_mobile'
import { RoomCredentials } from '../service/auth'
import { GetQueue } from '../service/queue'
import {
  GetRoomAsGuest,
  GetRoomAsMember,
  GetRoomPermissions,
  JoinRoomAsMember,
} from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { authHasLoaded } from '../state/util'
import DebugPage from './debug'
import QueuePage from './queue'
import RoomInfoPage from './room_info'
import RoomSettingsPage from './room_settings'
import SearchPage from './search'
import { ModalContainerStyle } from './styles'

enum PageState {
  NO_DATA,
  NO_PASSWORD,
  SHOULD_LOAD_ROOM,
  ROOM_LOADING,
  NO_GUEST_NAME,
  STALE_QUEUE,
  QUEUE_LOADING,
  READY,
  ERROR,
}

const tabs = ['queue', 'add', 'members', 'settings', 'debug']

function RoomPage() {
  const { room: code } = useParams()
  const [authState] = useContext(AuthContext)
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [pageState, setPageState] = useState(PageState.NO_DATA)
  const [modalState, setModalState] = useState<string>()
  const [searchParams, setSearchParams] = useSearchParams()
  const [passwordError, setPasswordError] = useState<string>()
  const navigate = useNavigate()
  const [tab, setTab] = useState('queue')
  const isMobile = useIsMobile()

  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.includes(tabParam)) {
      setTab(tabParam)
    }
  }, [])

  useEffect(() => {
    if (roomState) {
      document.title = `Queue Share - ${roomState.name}`
      if (localStorage.getItem('room_code') !== roomState.code) {
        localStorage.removeItem('room_password')
        localStorage.setItem('room_code', roomState.code)
      }
    }
  }, [roomState, code])

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        }
  }, [authState, roomState])

  const joinRoomAsUser = async (password: string) => {
    if (!code) return
    const response = await JoinRoomAsMember(code, password, authState.access_token ?? '')
    if ('error' in response) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('room_password')
        dispatchRoomState({
          type: 'set_room_password',
          payload: undefined,
        })
        setPageState(PageState.NO_PASSWORD)
        return
      }
      enqueueSnackbar(response.error, {
        variant: 'error',
        autoHideDuration: 3000,
      })
      setPageState(PageState.ERROR)
      return
    }
    const room = response.room
    setPageState(PageState.STALE_QUEUE)
    dispatchRoomState({
      type: 'join',
      payload: {
        name: room.name,
        host: {
          username: room.host.username,
          userDisplayName: room.host.display_name,
          userSpotifyAccount: room.host.spotify_name,
          userSpotifyImageURL: room.host.spotify_image_url,
        },
        code: room.code,
        roomPassword: password,
        userIsHost: false,
        userIsMember: true,
        userIsModerator: false,
      },
    })
  }

  const joinRoomAsGuest = async (password: string) => {
    if (!code) return
    const response = await GetRoomAsGuest(
      code,
      password,
      localStorage.getItem('room_guest_id') ?? undefined
    )

    if ('error' in response) {
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('room_password')
        dispatchRoomState({
          type: 'set_room_password',
          payload: undefined,
        })
        setPasswordError(response.error)
        setPageState(PageState.NO_PASSWORD)
      }
      enqueueSnackbar(response.error, {
        variant: 'error',
        autoHideDuration: 3000,
      })
      return
    }
    const room = response.room
    setPageState(
      response.guest_data || authState?.access_token
        ? PageState.STALE_QUEUE
        : PageState.NO_GUEST_NAME
    )
    dispatchRoomState({
      type: 'join',
      payload: {
        name: room.name,
        host: {
          username: room.host.username,
          userDisplayName: room.host.display_name,
          userSpotifyAccount: room.host.spotify_name,
          userSpotifyImageURL: room.host.spotify_image_url,
        },
        code: room.code,
        roomPassword: password,
        guestName: response.guest_data?.name ?? '',
      },
    })
  }

  const refreshQueue = useCallback(() => {
    if (!code) return
    GetQueue(code, roomCredentials).then((res) => {
      if ('error' in res) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('room_password')
          dispatchRoomState({
            type: 'set_room_password',
            payload: undefined,
          })
          setPasswordError(res.error)
          setPageState(PageState.NO_PASSWORD)
          return
        }
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      }
      setPageState(PageState.READY)
      dispatchRoomState({
        type: 'set_queue',
        payload: {
          currentlyPlaying: res.currently_playing,
          queue: res.queue ?? [],
        },
      })
    })
  }, [code, authState, localStorage, roomCredentials])

  useEffect(() => {
    if (!code) {
      navigate('/')
      return
    }
    const password = roomState?.roomPassword ?? localStorage.getItem('room_password') ?? ''
    if (!authHasLoaded(authState)) {
      return
    }
    switch (pageState) {
      case PageState.NO_DATA:
        // load room host to verify room exists and
        // to let us check if the user owns it (and
        // not prompt for a password)
        if (authState.access_token) {
          getRoomPermissions(code)
        } else {
          setPageState(PageState.NO_PASSWORD)
        }
        break
      case PageState.NO_PASSWORD:
        if (password) {
          setPageState(PageState.SHOULD_LOAD_ROOM)
        } else if (modalState !== 'password') {
          setModalState('password')
        }
        break
      case PageState.SHOULD_LOAD_ROOM:
        setPageState(PageState.ROOM_LOADING)
        if (roomState?.userIsMember) {
          loadRoomAsMember()
        } else if (authState.access_token) {
          joinRoomAsUser(password)
        } else {
          joinRoomAsGuest(password)
        }
        break
      case PageState.NO_GUEST_NAME:
        if (modalState !== 'guest') {
          setModalState('guest')
        }
        break
      case PageState.STALE_QUEUE:
        if (modalState) {
          setModalState(undefined)
        }
        setPageState(PageState.QUEUE_LOADING)
        refreshQueue()
        break
    }
  }, [pageState, authState])

  useEffect(() => {
    if (
      code &&
      roomState?.currentlyPlaying?.started_playing_epoch_ms &&
      !roomState?.currentlyPlaying?.paused
    ) {
      const timer = setTimeout(
        () => {
          refreshQueue()
        },
        roomState.currentlyPlaying.duration_ms -
          (Date.now() - roomState.currentlyPlaying.started_playing_epoch_ms)
      )
      return () => {
        clearTimeout(timer)
      }
    }
  }, [code, refreshQueue, roomState])

  const getRoomPermissions = (roomCode: string) => {
    GetRoomPermissions(roomCode, authState.access_token ?? '').then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        setPageState(PageState.ERROR)
        if (res.status === 404) {
          localStorage.removeItem('room_code')
          localStorage.removeItem('room_password')
          dispatchRoomState({ type: 'clear' })
          setModalState('not_found')
        }
        return
      }
      dispatchRoomState({
        type: 'set_permissions',
        payload: { ...res, code: code ?? '' },
      })
      if (res.is_member) {
        setPageState(PageState.SHOULD_LOAD_ROOM)
      } else {
        setPageState(PageState.NO_PASSWORD)
      }
    })
  }

  const loadRoomAsMember = () => {
    if (!code) return
    if (!authState.access_token) {
      enqueueSnackbar('User not authenticated', {
        variant: 'error',
        autoHideDuration: 3000,
      })
      setPageState(PageState.ERROR)
      return
    }
    GetRoomAsMember(code, authState.access_token).then((res) => {
      if ('error' in res) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem('room_password')
          dispatchRoomState({
            type: 'set_room_password',
            payload: undefined,
          })
          setPageState(PageState.NO_PASSWORD)
          return
        }
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        setPageState(PageState.ERROR)
        return
      }
      const room = res.room
      setPageState(PageState.STALE_QUEUE)
      dispatchRoomState({
        type: 'join',
        payload: {
          name: room.name,
          host: {
            username: room.host.username,
            userDisplayName: room.host.display_name,
            userSpotifyAccount: room.host.spotify_name,
            userSpotifyImageURL: room.host.spotify_image_url,
          },
          code: room.code,
        },
      })
    })
  }

  return (
    <Box
      className="scroll-no-bar"
      display="flex"
      justifyContent="center"
      width={tab === 'debug' || isMobile ? '100%' : 480}
      position="absolute"
      style={{
        top: 0,
        bottom: 60,
        overflowY: 'scroll',
        overflowX: 'hidden',
      }}
    >
      {tab === 'queue' ? (
        <QueuePage
          loading={pageState === PageState.QUEUE_LOADING || pageState === PageState.ROOM_LOADING}
          refresh={refreshQueue}
        />
      ) : tab === 'add' ? (
        <SearchPage />
      ) : tab === 'members' ? (
        <RoomInfoPage />
      ) : tab === 'settings' && roomState?.userIsHost ? (
        <RoomSettingsPage />
      ) : (
        <DebugPage />
      )}
      <Tabs
        value={tab}
        onChange={(_, val) => {
          if (val === 0) {
            setPageState(PageState.STALE_QUEUE)
            searchParams.delete('tab')
          } else {
            searchParams.set('tab', val as string)
          }
          setTab(val as string)
          setSearchParams(searchParams)
        }}
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          height: 60,
        }}
      >
        <TabList>
          <Tab
            value={'queue'}
            onDoubleClick={() => {
              setTab('debug')
              searchParams.set('tab', 'debug')
              setSearchParams(searchParams)
            }}
          >
            <ListItemDecorator>
              {tab === 'debug' ? <MdBugReport /> : <MdQueueMusic />}
            </ListItemDecorator>
            {tab === 'debug' ? 'Debug' : 'Queue'}
          </Tab>
          <Tab value={'add'}>
            <ListItemDecorator>
              <MdAdd />
            </ListItemDecorator>
            Add Songs
          </Tab>
          <Tab value={'members'}>
            <ListItemDecorator>
              <MdGroup />
            </ListItemDecorator>
            Members
          </Tab>
          {roomState?.userIsHost && (
            <Tab value={'settings'}>
              <ListItemDecorator>
                <MdSettings />
              </ListItemDecorator>
              Settings
            </Tab>
          )}
        </TabList>
      </Tabs>
      <GuestNameModal
        isOpen={modalState === 'guest'}
        onSuccess={() => setPageState(PageState.STALE_QUEUE)}
      />
      <PasswordModal
        isOpen={modalState === 'password'}
        onClose={() => navigate('/')}
        onSubmit={async (password) => {
          setPageState(PageState.ROOM_LOADING)
          authState?.access_token ? joinRoomAsUser(password) : joinRoomAsGuest(password)
        }}
        error={passwordError}
      />
      <Modal
        open={modalState === 'not_found'}
        onClose={() => navigate('/')}
        // slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}
      >
        <Card sx={ModalContainerStyle}>
          <Typography mb={1}>A room with the given code doesn't exist.</Typography>
          <Button
            onClick={() => {
              localStorage.removeItem('room_code')
              navigate('/')
            }}
          >
            OK
          </Button>
        </Card>
      </Modal>
    </Box>
  )
}

export default RoomPage
