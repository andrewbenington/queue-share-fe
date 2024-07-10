import { ExpandMore, Person } from '@mui/icons-material'
import { Card, Dropdown, Grid, ListItemButton, Menu, MenuButton, MenuItem } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { RemoveRoomMember, SetModerator } from '../service/room'
import { AuthContext } from '../state/auth'
import { RoomContext } from '../state/room'

export interface MemberProps {
  id: string
  name: string
  image?: string
  songs: number
  label: string
  refreshGuestsAndMembers: () => void
}

export function Member(props: MemberProps) {
  const { id, name, image, songs, label, refreshGuestsAndMembers } = props
  const [menuOpen, setMenuOpen] = useState(false)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)
  const handleClick = () => {
    setMenuOpen(!menuOpen)
  }

  return (
    <Card style={{ padding: 8 }}>
      <Grid
        container
        style={{
          alignItems: 'center',
        }}
      >
        <Grid xs={1} style={{ display: 'grid', alignItems: 'center' }}>
          {image ? (
            <img
              src={image ?? '/next.svg'}
              alt={name}
              width={32}
              height={32}
              style={{ borderRadius: 16 }}
            />
          ) : (
            <Person
              fontSize="small"
              style={{
                width: 32,
                height: 32,
                borderRadius: 32,
                backgroundColor: '#999',
              }}
            />
          )}
        </Grid>
        <Grid xs={6} style={{ paddingLeft: 10 }}>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontWeight: 'bold',
            }}
          >
            {name}
          </div>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {songs} Songs
          </div>
        </Grid>
        <Grid
          xs={5}
          style={{
            paddingLeft: 10,
            display: 'grid',
            justifyContent: 'right',
          }}
        >
          <Dropdown open={menuOpen}>
            <MenuButton
              onClick={
                roomState?.userIsHost && (label === 'Member' || label === 'Moderator')
                  ? handleClick
                  : undefined
              }
            >
              {label}
              <ExpandMore />
            </MenuButton>
            <Menu id="basic-menu">
              <ListItemButton
                onClick={async () => {
                  const res = await SetModerator(
                    roomState?.code ?? '',
                    authState?.access_token ?? '',
                    id,
                    label === 'Member'
                  )
                  if (res && 'error' in res) {
                    enqueueSnackbar(res.error, {
                      variant: 'error',
                      autoHideDuration: 3000,
                    })
                    return
                  }
                  refreshGuestsAndMembers()
                  setMenuOpen(false)
                }}
              >
                {label === 'Member' ? 'Set As Moderator' : 'Remove As Moderator'}
              </ListItemButton>
              <MenuItem
                onClick={() => {
                  RemoveRoomMember(roomState?.code ?? '', authState?.access_token ?? '', id).then(
                    (res) => {
                      if (res && 'error' in res) {
                        enqueueSnackbar(res.error, {
                          variant: 'error',
                          autoHideDuration: 3000,
                        })
                        return
                      }
                      refreshGuestsAndMembers()
                      setMenuOpen(false)
                    }
                  )
                }}
              >
                Remove from room
              </MenuItem>
            </Menu>
          </Dropdown>
        </Grid>
      </Grid>
    </Card>
  )
}
