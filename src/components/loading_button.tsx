import { CircularProgress, ButtonProps } from '@mui/material';
import { StyledButton } from '../pages/styles';

interface LoadingButtonProps extends ButtonProps {
  loading: boolean;
}

export function LoadingButton(props: LoadingButtonProps) {
  const { loading, children, ...buttonProps } = props;

  return (
    <StyledButton {...buttonProps}>
      {loading ? <CircularProgress size={20} color="secondary" /> : children}
    </StyledButton>
  );
}
