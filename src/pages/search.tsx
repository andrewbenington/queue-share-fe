import { Alert, Box, CircularProgress, IconButton, Input, Typography } from '@mui/joy'
import { debounce } from 'lodash'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MdAdd, MdCheck } from 'react-icons/md'
import CollapsingProgress from '../components/display/collapsing-progress'
import { TrackRibbon } from '../components/track-ribbon'
import useIsMobile from '../hooks/is_mobile'
import { RoomCredentials } from '../service/auth'
import { AddToRoomQueue } from '../service/queue'
import { SearchTracksFromRoom, SuggestedTracks } from '../service/stats/tracks'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'
import { TrackData } from '../types/spotify'

export default function SearchPage() {
  const [search, setSearch] = useState<string>('')
  const [results, setResults] = useState<TrackData[]>([])
  const [roomState, dispatchRoomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [pendingSong, setPendingSong] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [suggestedTracks, setSuggestedTracks] = useState<TrackData[]>()
  const [noSuggestionsPermission, setNoSuggestionsPermission] = useState(false)
  const isMobile = useIsMobile()

  const addToQueue = (songID: string) => {
    if (pendingSong || !roomState) {
      return
    }
    setPendingSong(songID)
    AddToRoomQueue(roomState.code, roomCredentials, songID)
      .then((res) => {
        if ('error' in res) {
          if (res.status === 403) {
            localStorage.removeItem('room_password')
          }
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        } else {
          dispatchRoomState({
            type: 'set_queue',
            payload: {
              currentlyPlaying: res.currently_playing,
              queue: res.queue ?? [],
            },
          })
        }
      })
      .finally(() => setPendingSong(null))
  }

  useEffect(() => {
    if (roomState?.code && !suggestedTracks && !loading) {
      SuggestedTracks(roomState.code, roomCredentials).then((res) => {
        if ('error' in res) {
          if (res.status === 403) {
            setNoSuggestionsPermission(true)
            return
          }
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        }
        setSuggestedTracks(res)
      })
    }
  }, [suggestedTracks])

  useEffect(() => {
    const storedSearch = localStorage.getItem('last_search')
    if (search === '' && storedSearch && storedSearch !== '') {
      setSearch(storedSearch)
    }
    if (!storedSearch || storedSearch === '') {
      localStorage.removeItem('last_search')
      localStorage.removeItem('last_search_results')
      setResults([])
    }
  }, [search])

  useEffect(() => {
    const storedResults = localStorage.getItem('last_search_results')
    if (search === '' && storedResults && storedResults !== '') {
      setResults(JSON.parse(storedResults))
    }
  }, [search])

  const getResults = useCallback(
    debounce(async (searchTerm) => {
      if (!roomState || searchTerm.length < 2) {
        return
      }
      setLoading(true)
      const res = await SearchTracksFromRoom(roomState.code, roomCredentials, searchTerm)
      setLoading(false)
      if ('error' in res) {
        if (res.status === 403) {
          localStorage.removeItem('room_password')
        }
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      } else {
        setResults(res)
        localStorage.setItem('last_search_results', JSON.stringify(res))
      }
    }, 500),
    []
  )

  const roomCredentials: RoomCredentials = useMemo(() => {
    return authState.access_token
      ? { token: authState.access_token }
      : {
          guestID: localStorage.getItem('room_guest_id') ?? '',
          roomPassword: roomState?.roomPassword ?? '',
        }
  }, [authState, roomState])

  return (
    <Box width={isMobile ? '97%' : '100%'}>
      <Input
        type="search"
        placeholder="Search Spotify"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value)
          localStorage.setItem('last_search', e.target.value)
          getResults(e.target.value)
        }}
        sx={{
          marginBottom: '10px',
          marginTop: '10px',
          width: '100%',
        }}
      />
      <CollapsingProgress loading={loading} />
      {results?.length ? <Typography>Results:</Typography> : <div />}
      {results?.map((track, i) => (
        <TrackRibbon
          key={`result_${i}`}
          track={track}
          rightComponent={
            <AddToQueueButton
              loading={pendingSong === track.id}
              disabled={!!pendingSong}
              added={roomState?.queue?.some((t) => t.id === track.id) ?? false}
              addToQueue={() => addToQueue(track.id)}
            />
          }
        />
      ))}

      {(!results || results.length === 0) && (
        <>
          <Typography>Suggestions</Typography>
          {suggestedTracks?.map((track, i) => (
            <TrackRibbon
              key={`result_${i}`}
              track={track}
              rightComponent={
                <AddToQueueButton
                  loading={pendingSong === track.id}
                  disabled={!!pendingSong}
                  added={roomState?.queue?.some((t) => t.id === track.id) ?? false}
                  addToQueue={() => addToQueue(track.id)}
                />
              }
            />
          ))}
        </>
      )}
      {noSuggestionsPermission && (
        <Alert color="danger" sx={{ mt: 1 }}>
          {roomState?.userIsHost
            ? 'Re-link your Spotify account to allow track suggestions'
            : 'Host must re-link their Spotify account to allow track suggestions'}
        </Alert>
      )}
    </Box>
  )
}

function AddToQueueButton(props: {
  added: boolean
  loading: boolean
  disabled: boolean
  addToQueue: () => void
}) {
  const { added, loading, disabled, addToQueue } = props
  return added ? (
    <MdCheck style={{ color: '#00ff00', marginRight: 8 }} />
  ) : loading ? (
    <CircularProgress size="sm" style={{ marginRight: 8 }} />
  ) : (
    <IconButton onClick={addToQueue} disabled={disabled}>
      <MdAdd />
    </IconButton>
  )
}
