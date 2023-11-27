import { ExpandMore, Person } from '@mui/icons-material';
import { Chip, Grid, Menu, MenuItem } from '@mui/material';
import { enqueueSnackbar } from 'notistack';
import { useContext, useRef, useState } from 'react';
import {
  RemoveRoomMember,
  RoomGuestsAndMembers,
  SetModerator,
} from '../service/room';
import { AuthContext } from '../state/auth';
import { RoomContext } from '../state/room';

export interface MemberProps {
  id: string;
  name: string;
  image?: string;
  songs: number;
  label: string;
  setGuestsAndMembers: (res: RoomGuestsAndMembers) => void;
}

export function Member(props: MemberProps) {
  const { id, name, image, songs, label, setGuestsAndMembers } = props;
  const [menuOpen, setMenuOpen] = useState(false);
  const [roomState] = useContext(RoomContext);
  const [authState] = useContext(AuthContext);
  const chip = useRef(null);
  const handleClick = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <Grid
      container
      style={{
        alignItems: 'center',
        marginBottom: 10,
        backgroundColor: '#444',
        borderRadius: 5,
        padding: '5px 10px',
      }}
    >
      <Grid item xs={1} style={{ display: 'grid', alignItems: 'center' }}>
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
      <Grid item xs={6} style={{ paddingLeft: 10 }}>
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
        item
        xs={5}
        style={{
          paddingLeft: 10,
          display: 'grid',
          justifyContent: 'right',
        }}
      >
        <Chip
          ref={chip}
          label={label}
          deleteIcon={<ExpandMore style={{}} />}
          onDelete={
            roomState?.userIsHost &&
            (label === 'Member' || label === 'Moderator')
              ? handleClick
              : undefined
          }
          onClick={
            roomState?.userIsHost &&
            (label === 'Member' || label === 'Moderator')
              ? handleClick
              : undefined
          }
        />
      </Grid>
      <Menu
        id="basic-menu"
        anchorEl={chip.current}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            SetModerator(
              roomState?.code ?? '',
              authState?.access_token ?? '',
              id,
              label === 'Member'
            ).then((res) => {
              if ('error' in res) {
                enqueueSnackbar(res.error, {
                  variant: 'error',
                  autoHideDuration: 3000,
                });
                return;
              }
              setGuestsAndMembers(res);
            });
            setMenuOpen(false);
          }}
        >
          {label === 'Member' ? 'Set As Moderator' : 'Remove As Moderator'}
        </MenuItem>
        <MenuItem
          onClick={() => {
            RemoveRoomMember(
              roomState?.code ?? '',
              authState?.access_token ?? '',
              id
            ).then((res) => {
              if ('error' in res) {
                enqueueSnackbar(res.error, {
                  variant: 'error',
                  autoHideDuration: 3000,
                });
                return;
              }
              setGuestsAndMembers(res);
            });
            setMenuOpen(false);
          }}
        >
          Remove from room
        </MenuItem>
      </Menu>
    </Grid>
  );
}
