import { Refresh } from '@mui/icons-material'
import { Box, IconButton, Option, Select, SelectProps } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { SpotifyPlaylist, UserPlaylists } from '../../service/player_context'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'
import Playlist from './playlist'

interface PlaylistSelectProps extends SelectProps<string, false> {
  onPlaylistSelect: (id: string) => void
  currentPlaylist?: string
  refreshButton?: boolean
}
const PlaylistSelect = (props: PlaylistSelectProps) => {
  const { onPlaylistSelect, currentPlaylist, refreshButton, ...fieldProps } = props
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | undefined>(currentPlaylist)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!playlists && !error) {
      getUserPlaylists()
    }
  }, [playlists, error])

  const getUserPlaylists = () => {
    if (roomState?.code && authState.access_token) {
      UserPlaylists(roomState?.code, authState.access_token).then((res) => {
        if ('error' in res) {
          setError(true)
          enqueueSnackbar(res.error, {
            variant: 'error',
            autoHideDuration: 3000,
          })
          return
        }
        if (res.items.length > 0) {
          setSelectedPlaylist(res.items[0].id)
          onPlaylistSelect(res.items[0].id)
        }
        setPlaylists(res.items)
      })
    }
  }

  return playlists ? (
    <Box display="flex" alignItems="center">
      <Select
        placeholder="Playlist"
        value={selectedPlaylist}
        onChange={(_, val) => {
          setSelectedPlaylist(val ?? undefined)
          val && onPlaylistSelect(val)
        }}
        {...fieldProps}
      >
        {playlists.map((playlist) => (
          <Option key={playlist.id} value={playlist.id}>
            <Playlist playlist={playlist} />
          </Option>
        ))}
      </Select>
      {refreshButton && (
        <IconButton
          // variant="outlined"
          size="sm"
          color="neutral"
          onClick={getUserPlaylists}
          sx={{ mt: 2, mb: 1.5, ml: 0, mr: 1.5, width: 40, height: 40 }}
        >
          <Refresh />
        </IconButton>
      )}
    </Box>
  ) : (
    <div />
  )
}

export default PlaylistSelect
