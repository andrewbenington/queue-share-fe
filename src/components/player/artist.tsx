import { Typography } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useEffect, useState } from 'react'
import { Artist } from 'spotify-types'
import { GetArtist } from '../../service/player_context'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'

interface PlaylistProps {
  artist?: Artist
  id?: string
}

export default function ArtistDisplay(props: PlaylistProps) {
  const { id } = props
  const [artist, setArtist] = useState<Artist | undefined>(props.artist)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)

  useEffect(() => {
    if (!roomState || !authState.access_token || !id) return
    GetArtist(roomState.code, authState.access_token, id).then((res) => {
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      }
      setArtist(res)
    })
  }, [id])

  return artist ? (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
      }}
    >
      <img src={artist.images[0]?.url ?? ''} width={40} height={40} style={{ marginRight: 10 }} />
      <Typography
        paddingRight={2}
        style={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {artist.name}
      </Typography>
    </div>
  ) : (
    <div />
  )
}
