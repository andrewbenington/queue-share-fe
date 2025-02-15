import { Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { GetPlaylist, QSPlaylist } from '../../service/player_context'
import { AuthContext } from '../../state/auth'
import { BuilderContext } from '../../state/builder'
import { RoomContext } from '../../state/room'

interface PlaylistProps {
  playlist?: QSPlaylist
  id?: string
  queueable?: boolean
  imageSize?: number
}

export default function PlaylistDisplay(props: PlaylistProps) {
  const { id, queueable, imageSize } = props
  const [playlist, setPlaylist] = useState<QSPlaylist | undefined>(props.playlist)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const [, dispatchBuilderState] = useContext(BuilderContext)

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
  }, [id, authState.access_token, roomState])

  return playlist ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        overflow: 'hidden',
      }}
    >
      <img
        src={playlist?.image_url}
        width={imageSize ?? 40}
        height={imageSize ?? 40}
        style={{ marginRight: 10 }}
        onDoubleClick={() =>
          queueable && dispatchBuilderState({ type: 'add_playlist', payload: playlist })
        }
      />
      <Typography
        paddingRight={2}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: 11,
          fontWeight: 'bold',
        }}
      >
        {playlist.name}
      </Typography>
    </div>
  ) : (
    <div />
  )
}
