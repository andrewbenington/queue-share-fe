import { Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { Playlist } from 'spotify-types'
import { GetPlaylist, SpotifyPlaylist } from '../../service/player_context'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'

interface PlaylistProps {
  playlist?: SpotifyPlaylist
  id?: string
}

export default function PlaylistDisplay(props: PlaylistProps) {
  const { id } = props
  const [playlist, setPlaylist] = useState<SpotifyPlaylist | Playlist | undefined>(props.playlist)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)

  useEffect(() => {
    if (props.playlist) {
      setPlaylist(props.playlist)
    }
  }, [props])

  useEffect(() => {
    if (!roomState || !authState.access_token || !id) return
    GetPlaylist(roomState.code, authState.access_token, id).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      }
      setPlaylist(res)
    })
  }, [id])

  return playlist ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <img
        src={playlist?.images ? playlist.images[0]?.url : ''}
        width={40}
        height={40}
        style={{ marginRight: 10 }}
      />
      <Typography
        paddingRight={2}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {playlist.name}
      </Typography>
    </div>
  ) : (
    <div />
  )
}
