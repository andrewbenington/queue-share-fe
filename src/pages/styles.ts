import { Button, Paper, styled } from '@mui/material';

export const RoundedRectangle = styled(Paper)({
  borderRadius: 5,
  padding: 15,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
});

export const StyledButton = styled(Button)({
  borderRadius: 5,
});

export const ModalContainerStyle = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  maxWidth: '90%',
  p: 4,
};
