import { Card, Checkbox, Input, Modal } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { ChangeEvent, useContext, useState } from 'react'
import { ModalContainerStyle } from '../../pages/styles'
import { AddRoomMember, RoomGuestsAndMembers } from '../../service/room'
import { AuthContext } from '../../state/auth'
import { RoomContext } from '../../state/room'
import LoadingButton from '../loading-button'

interface AddMemberModalProps {
  isOpen: boolean
  onClose: () => void
  updateMembers: (gm: RoomGuestsAndMembers) => void
}

function AddMemberModal(props: AddMemberModalProps) {
  const { isOpen, updateMembers } = props
  const onClose = () => {
    setError(undefined)
    props.onClose()
  }
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string>()
  const [addMemberModerator, setAddMemberModerator] = useState(false)
  const [roomState] = useContext(RoomContext)
  const [authState] = useContext(AuthContext)

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      // slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Card sx={ModalContainerStyle}>
        <Input
          placeholder="Username"
          value={username}
          // inputProps={{
          //   autocomplete: 'off',
          // }}
          onChange={(e) => setUsername(e.target.value)}
          type="text"
          error={!!error}
          // helperText={error}
          style={{ marginBottom: 10 }}
        />
        <Checkbox
          label="Set Moderator"
          checked={addMemberModerator}
          onChange={(e) =>
            setAddMemberModerator((e as ChangeEvent<HTMLInputElement>).target.checked)
          }
          style={{ marginBottom: 10 }}
        />
        <LoadingButton
          onClickAsync={async () => {
            if (!roomState || !authState.access_token) {
              enqueueSnackbar('Authentication error', {
                variant: 'error',
                autoHideDuration: 3000,
              })
              setError(undefined)
              onClose()
              return
            }
            const response = await AddRoomMember(
              roomState.code,
              authState.access_token,
              username,
              addMemberModerator
            )
            if (response && 'error' in response) {
              setError(response.error)
              return
            }
            setError(undefined)
            updateMembers(response)
            enqueueSnackbar('User added successfully', {
              variant: 'success',
              autoHideDuration: 3000,
            })
            onClose()
          }}
          variant="solid"
        >
          Add
        </LoadingButton>
      </Card>
    </Modal>
  )
}

export default AddMemberModal
