import { Accordion, Alert, Box, Card, CircularProgress, Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { MdLaunch } from 'react-icons/md'
import useIsMobile from '../../hooks/is_mobile'
import { PlayPlayback } from '../../service/playback'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'
import LoadingButton from '../loading-button'
import PlaylistSelect from '../player/playlists'
import DeviceSelect from './devices_select'

export default function StartPanel(props: { loading: boolean; refresh: () => void }) {
  const { loading, refresh } = props
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [selectedDevice, setSelectedDevice] = useState<string>()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>()
  const isMobile = useIsMobile()

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      flex={1}
      width="100%"
      padding={isMobile ? 1 : 0}
    >
      <Accordion expanded={loading} style={{ display: 'grid', justifyContent: 'center' }}>
        {/* <Fade in={loading} style={{ margin: 10 }}> */}
        <CircularProgress />
        {/* </Fade> */}
      </Accordion>
      {loading || roomState?.queue === undefined ? (
        <Typography textAlign="center">Loading...</Typography>
      ) : !roomState?.userIsHost ? (
        <Typography textAlign="center">Host is not playing music</Typography>
      ) : (
        <Card sx={{ width: '100%', p: 0 }}>
          <Alert color="warning" sx={{ m: 1 }}>
            A device will not appear unless the Spotify app or{' '}
            <a href={'https://spotify.com'} target="_blank">
              website
              <MdLaunch fontSize="inherit" />
            </a>{' '}
            is open.
          </Alert>
          <DeviceSelect onDeviceSelect={setSelectedDevice} />
          <PlaylistSelect onPlaylistSelect={setSelectedPlaylist} refreshButton sx={{ m: 1.5 }} />

          <LoadingButton
            onClickAsync={async () => {
              const response = await PlayPlayback(
                roomState.code,
                authState.access_token ?? '',
                selectedDevice,
                selectedPlaylist
              )
              if (response && 'error' in response) {
                enqueueSnackbar(response.error, {
                  variant: 'error',
                  autoHideDuration: 3000,
                })
                return
              }
              new Promise((r) => setTimeout(r, 1000)).then(refresh)
            }}
            style={{ margin: 12 }}
            variant="solid"
            disabled={!selectedDevice || !selectedPlaylist}
          >
            Start Playing
          </LoadingButton>
        </Card>
      )}
    </Box>
  )
}
