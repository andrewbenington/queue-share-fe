import { Button, Card, Input, Modal } from '@mui/joy'
import { useState } from 'react'
import { ModalContainerStyle } from '../../pages/styles'
import LoadingButton from '../loading-button'

interface PasswordModalProps {
  isOpen: boolean
  error?: string
  onSubmit: (password: string) => Promise<void>
  onClose: () => void
}

export default function PasswordModal(props: PasswordModalProps) {
  const { isOpen, onSubmit, onClose, error } = props
  const [enteredPass, setEnteredPass] = useState<string>('')

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
          placeholder="Password"
          value={enteredPass}
          type="password"
          autoComplete="off"
          onChange={(e) => setEnteredPass(e.target.value)}
          error={!!error}
          // helperText={error}
          sx={{ mb: 1 }}
        />
        <LoadingButton
          variant="solid"
          onClickAsync={() => onSubmit(enteredPass)}
          style={{ marginBottom: 8 }}
        >
          Submit
        </LoadingButton>
        <Button onClick={onClose}>Cancel</Button>
      </Card>
    </Modal>
  )
}
