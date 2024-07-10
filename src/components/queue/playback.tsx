import {
  MusicNote,
  Pause,
  PlayArrow,
  Repeat,
  RepeatOn,
  RepeatOneOn,
  Shuffle,
  ShuffleOn,
  SkipNext,
  SkipPrevious,
  VolumeDown,
  VolumeUp,
} from '@mui/icons-material'
import {
  Box,
  Card,
  Chip,
  Grid,
  IconButton,
  LinearProgress,
  Slider,
  Stack,
  Typography,
} from '@mui/joy'
import { padStart } from 'lodash'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useMemo, useState } from 'react'
import useIsMobile from '../../hooks/is_mobile'
import {
  GetPlayerState,
  NextPlayback,
  PausePlayback,
  PlayPlayback,
  PlayerState,
  PreviousPlayback,
  SetPlaybackVolume,
} from '../../service/playback'
import { AuthContext } from '../../state/auth'
import { QSTrack, RoomContext } from '../../state/room'
import SpotifyContext from '../player/spotify_context'
import SpotifyDevice from './device'

export default function PlaybackControls(props: { refresh: () => void }) {
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [volume, setVolume] = useState<number>(0)
  const [progress, setProgress] = useState(0)
  const [lastStateFetch, setlastStateFetch] = useState<number>()
  const [playerState, setPlayerState] = useState<PlayerState>()
  const [playRequested, setPlayRequested] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    getPlayerState()
  }, [roomState, authState])

  const refresh = () => {
    props.refresh()
    getPlayerState()
  }

  const updateVolume = async (value: number) => {
    if (!roomState || !authState.access_token) {
      return
    }
    const res = await SetPlaybackVolume(roomState.code, authState.access_token, value)
    if (res && 'error' in res) {
      enqueueSnackbar(res.error, {
        variant: 'error',
        autoHideDuration: 3000,
      })
      return
    }
  }

  useEffect(() => {
    if (!playerState) {
      setProgress(0)
      return
    }

    if (playerState.progress_ms !== null && playerState.item && lastStateFetch !== undefined) {
      const progressMillis = playerState.progress_ms + (Date.now() - lastStateFetch)
      if (progressMillis >= playerState.item.duration_ms) {
        getPlayerState()
      }
    }
    if (playerState.is_playing && !playRequested) {
      const timer = setInterval(() => {
        if (playerState.progress_ms !== null && playerState.item && lastStateFetch !== undefined) {
          const progressMillis = playerState.progress_ms + (Date.now() - lastStateFetch)
          setProgress(Math.min(progressMillis, playerState.item.duration_ms))
        }
      }, 50)

      return () => {
        clearInterval(timer)
      }
    }
  }, [playerState])

  const getPlayerState = () => {
    if (!roomState || !authState.access_token) return
    GetPlayerState(roomState.code, authState.access_token).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      }
      setVolume(res.device.volume_percent ?? 0)
      setPlayerState(res)
      setlastStateFetch(Date.now())
    })
  }

  function formatTime(time: number): string {
    const minutes = `${Math.floor(Math.abs(time) / 60000)}`
    const seconds = padStart(`${Math.floor(Math.abs(time) / 1000) % 60}`, 2, '0')
    return `${time < 0 ? '-' : ''}${minutes}:${seconds}`
  }

  const song: QSTrack | undefined = useMemo(() => {
    const s = playerState?.item
    if (!s) return undefined
    if (!('external_ids' in s)) return undefined
    const lastImage = s.album.images[s.album.images.length - 1]
    return {
      ...s,
      image: lastImage
        ? {
            url: lastImage.url,
            height: lastImage.height ?? 32,
            width: lastImage.width ?? 32,
          }
        : undefined,
    }
  }, [playerState])

  if (!roomState) return <div />

  return (
    <Box mb={2}>
      <Card sx={{ p: 1.5, mb: 1 }}>
        <Grid container>
          {playerState?.item && 'artists' in playerState.item && (
            <Grid xs={12}>
              <Box display="flex" alignItems="center" paddingRight={1} marginBottom={0.75}>
                {song?.image ? (
                  <img
                    src={song.image.url}
                    alt={song.name ?? 'empty'}
                    width={64}
                    height={64}
                    style={{ borderRadius: 5 }}
                  />
                ) : (
                  <Box
                    width={64}
                    height={64}
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    sx={{ backgroundColor: 'grey' }}
                    style={{ borderRadius: 5 }}
                  >
                    <MusicNote fontSize="large" />
                  </Box>
                )}
                <Box
                  paddingLeft={1}
                  flex={1}
                  style={{
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      fontWeight: 'bold',
                    }}
                  >
                    {song?.name}
                  </div>
                  <div
                    style={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {song?.artists && song.artists.length
                      ? song.artists.map((artist) => artist.name).join(', ')
                      : song?.album.name}{' '}
                    • {song?.album.name ?? ''}
                  </div>
                </Box>
                {roomState?.currentlyPlaying?.added_by ? (
                  <Chip>{roomState.currentlyPlaying.added_by}</Chip>
                ) : (
                  <div />
                )}
              </Box>
            </Grid>
          )}
          <Grid xs={12}>
            {playerState?.item && playerState?.progress_ms !== null ? (
              <>
                <LinearProgress
                  determinate
                  value={100 * (progress / playerState.item.duration_ms)}
                  sx={{ mt: 1 }}
                />
                <Grid container>
                  <Grid xs={12} height={10}></Grid>
                  <Grid xs={2}>{formatTime(progress)}</Grid>
                  <Grid xs={8} />
                  <Grid xs={2} display="grid" justifyContent="right">
                    {formatTime(-1 * (playerState.item.duration_ms - progress))}
                  </Grid>
                </Grid>
              </>
            ) : (
              <div />
            )}
          </Grid>
          {roomState.userIsModerator && (
            <Grid
              xs={12}
              display="flex"
              justifyContent="center"
              alignItems="center"
              marginTop={1}
              paddingLeft={1}
              style={{ backgroundColor: 'grey', borderRadius: 20 }}
            >
              <Stack spacing={1} direction="row" alignItems="center" flex={1}>
                <VolumeDown />
                <Slider
                  aria-label="Volume"
                  value={volume ?? 0}
                  onChange={(e) => {
                    if (!e.target) return
                    const target = e.target as { value?: number }
                    if (!target.value) return
                    setVolume(target.value)
                  }}
                  onChangeCommitted={() => {
                    updateVolume(volume)
                  }}
                  disabled={
                    volume === undefined || (playerState?.device?.type as string) === 'Smartphone'
                  }
                />
                <VolumeUp />
              </Stack>
              <Stack direction="row" spacing={0.5} justifyContent="center">
                <IconButton
                  variant="plain"
                  disabled={playRequested}
                  onClick={() => {
                    PreviousPlayback(roomState.code, authState.access_token ?? '').then((res) => {
                      if (res && 'error' in res) {
                        enqueueSnackbar(res.error, {
                          variant: 'error',
                          autoHideDuration: 3000,
                        })
                        return
                      }
                      new Promise((r) => setTimeout(r, 1000)).then(refresh)
                    })
                  }}
                >
                  <SkipPrevious />
                </IconButton>
                <IconButton
                  variant="plain"
                  disabled={playRequested}
                  onClick={() => {
                    setPlayRequested(true)
                    roomState.currentlyPlaying?.paused
                      ? PlayPlayback(roomState.code, authState.access_token ?? '').then((res) => {
                          setPlayRequested(false)
                          if (res && 'error' in res) {
                            enqueueSnackbar(res.error, {
                              variant: 'error',
                              autoHideDuration: 3000,
                            })
                            return
                          }
                          new Promise((r) => setTimeout(r, 1000)).then(refresh)
                        })
                      : PausePlayback(roomState.code, authState.access_token ?? '').then((res) => {
                          setPlayRequested(false)
                          if (res && 'error' in res) {
                            enqueueSnackbar(res.error, {
                              variant: 'error',
                              autoHideDuration: 3000,
                            })
                            return
                          }
                          new Promise((r) => setTimeout(r, 1000)).then(refresh)
                        })
                    dispatchRoomState({
                      type: 'set_paused',
                      payload: !roomState.currentlyPlaying?.paused,
                    })
                  }}
                >
                  {roomState.currentlyPlaying?.paused ? <PlayArrow /> : <Pause />}
                </IconButton>
                <IconButton
                  disabled={playRequested}
                  onClick={() => {
                    NextPlayback(roomState.code, authState.access_token ?? '').then((res) => {
                      if (res && 'error' in res) {
                        enqueueSnackbar(res.error, {
                          variant: 'error',
                          autoHideDuration: 3000,
                        })
                        return
                      }
                      new Promise((r) => setTimeout(r, 1000)).then(refresh)
                    })
                  }}
                >
                  <SkipNext />
                </IconButton>
              </Stack>
              <Box flex={1} display="flex" justifyContent="space-evenly">
                {playerState?.shuffle_state ? <ShuffleOn /> : <Shuffle />}
                {playerState?.repeat_state === 'context' ? (
                  <RepeatOn />
                ) : playerState?.repeat_state === 'track' ? (
                  <RepeatOneOn />
                ) : (
                  <Repeat />
                )}
              </Box>
            </Grid>
          )}
        </Grid>
      </Card>
      <Grid container marginBottom={1}>
        {roomState.userIsModerator && (
          <Grid xs={isMobile ? 12 : 6}>
            <Typography fontSize="medium">
              {playerState?.context?.type
                ? playerState.context.type.charAt(0).toLocaleUpperCase() +
                  playerState.context.type.substring(1)
                : 'Context'}
            </Typography>
            <Card sx={{ p: 1, height: 40 }}>
              <SpotifyContext uri={playerState?.context?.uri ?? ''} />
            </Card>
          </Grid>
        )}
        {roomState.userIsModerator && (
          <Grid xs={isMobile ? 12 : 6} sx={{ pl: isMobile ? 0 : 1, mt: isMobile ? 1 : 0 }}>
            <Typography fontSize="medium">Device</Typography>
            {playerState?.device ? (
              <Card sx={{ p: 1, height: 40, display: 'flex', justifyContent: 'center' }}>
                <SpotifyDevice {...playerState.device} />
              </Card>
            ) : (
              <div />
            )}
          </Grid>
        )}
      </Grid>
    </Box>
  )
}
