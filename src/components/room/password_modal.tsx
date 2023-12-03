import { Backdrop, Fade, Modal, TextField } from '@mui/material';
import { useState } from 'react';
import {
  ModalContainerStyle,
  RoundedRectangle,
  StyledButton,
} from '../../pages/styles';
import { LoadingButton } from '../loading_button';

interface PasswordModalProps {
  isOpen: boolean;
  loading: boolean;
  error?: string;
  onSubmit: (password: string) => void;
  onClose: () => void;
}

export default function PasswordModal(props: PasswordModalProps) {
  const { isOpen, loading, onSubmit, onClose, error } = props;
  const [enteredPass, setEnteredPass] = useState<string>('');

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
            loading={loading}
            variant="contained"
            onClick={() => onSubmit(enteredPass)}
            sx={{ mb: 1 }}
          >
            Submit
          </LoadingButton>
          <StyledButton variant="outlined" onClick={onClose}>
            Cancel
          </StyledButton>
        </RoundedRectangle>
      </Fade>
    </Modal>
  );
}
