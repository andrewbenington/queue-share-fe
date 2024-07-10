import { Person } from '@mui/icons-material'
import { Button, Card, Chip, Grid, Menu, MenuItem } from '@mui/joy'
import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Room } from '../service/room'

export interface RoomPreviewProps {
  room: Room
}

export function RoomPreview(props: RoomPreviewProps) {
  const { room } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const menuButton = useRef(null)
  const navigate = useNavigate()

  return (
    <Card sx={{ padding: 1 }}>
      <Grid
        container
        style={{
          alignItems: 'center',
        }}
      >
        <Grid
          xs={10}
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
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
            {room.name}
          </div>
          <Chip
            startDecorator={
              room.host.spotify_image_url ? (
                <img
                  src={room.host.spotify_image_url}
                  alt={`${room.host.display_name} Spotify Image`}
                  width={24}
                  height={24}
                  style={{ borderRadius: 12 }}
                />
              ) : (
                <Person
                  fontSize="small"
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: '#999',
                  }}
                />
              )
            }
            sx={{ m: 1 }}
          >
            {room.host.display_name}
          </Chip>
        </Grid>
        <Grid
          xs={2}
          style={{
            paddingLeft: 10,
            display: 'grid',
            justifyContent: 'right',
          }}
        >
          <Button sx={{ mr: 0.5 }} onClick={() => navigate(`/room/${room.code}`)}>
            Rejoin
          </Button>
        </Grid>
        <Menu
          id="basic-menu"
          anchorEl={menuButton.current}
          open={menuOpen}
          onClose={() => setMenuOpen(false)}
          // MenuListProps={{
          //   'aria-labelledby': 'basic-button',
          // }}
        >
          <MenuItem
            onClick={() => {
              setMenuOpen(false)
            }}
          >
            Leave Room
          </MenuItem>
        </Menu>
      </Grid>
    </Card>
  )
}
