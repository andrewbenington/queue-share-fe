import { Backdrop, Fade, Modal, TextField } from '@mui/material'
import { useState } from 'react'
import { ModalContainerStyle, RoundedRectangle, StyledButton } from '../../pages/styles'
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
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
      closeAfterTransition
      slots={{ backdrop: Backdrop }}
      slotProps={{
        backdrop: {
          timeout: 500,
        },
      }}
    >
      <Fade in={isOpen}>
        <RoundedRectangle sx={ModalContainerStyle}>
          <TextField
            variant="outlined"
            label="Password"
            value={enteredPass}
            type="password"
            autoComplete="off"
            onChange={(e) => setEnteredPass(e.target.value)}
            error={!!error}
            helperText={error}
            sx={{ mb: 1 }}
          />
          <LoadingButton
            variant="contained"
            onClickAsync={() => onSubmit(enteredPass)}
            style={{ marginBottom: 8 }}
          >
            Submit
          </LoadingButton>
          <StyledButton variant="outlined" onClick={onClose}>
            Cancel
          </StyledButton>
        </RoundedRectangle>
      </Fade>
    </Modal>
  )
}
