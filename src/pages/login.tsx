import { Box, FormControl, TextField } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import { CreateAccount, UserLogin } from '../service/user';
import { RoundedRectangle, StyledButton } from './styles';
import { AuthContext } from '../state/auth';
import { useNavigate } from 'react-router-dom';
import { enqueueSnackbar } from 'notistack';

function CreateAccountForm() {
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [takenUsername, setTakenUsername] = useState('');
  const [, dispatchAuthState] = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Create Account - Queue Share';
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const submittedUsername = username;
    CreateAccount(username, displayName, password).then((resp) => {
      if ('error' in resp) {
        if (resp.networkError) {
          enqueueSnackbar('Network error', { variant: 'error' });
          dispatchAuthState({ type: 'error', payload: resp.error });
        }
        if (resp.usernameTaken) {
          setTakenUsername(submittedUsername);
        }
      } else {
        dispatchAuthState({
          type: 'login',
          payload: {
            token: resp.token,
            expires_at: new Date(resp.expires_at),
            user: resp.user,
          },
        });
        navigate('/');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <TextField
          variant="outlined"
          label="Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={takenUsername !== '' && takenUsername === username}
          helperText={
            takenUsername !== '' &&
            takenUsername === username &&
            `${takenUsername} is taken`
          }
          sx={{ mb: 2, width: 300 }}
        />
        <TextField
          variant="outlined"
          label="Display Name"
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="outlined"
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          variant="outlined"
          label="Confirm Password"
          id="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword !== '' && confirmPassword !== password}
          helperText={
            confirmPassword !== '' &&
            confirmPassword !== password &&
            'Password must match'
          }
          sx={{ mb: 1 }}
        />
        <StyledButton
          variant="contained"
          type="submit"
          sx={{ mb: 1 }}
          disabled={password === '' || confirmPassword !== password}
        >
          Create
        </StyledButton>
      </FormControl>
    </form>
  );
}

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isError, setIsError] = useState(false);
  const [authState, dispatchAuthState] = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'Log In - Queue Share';
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    UserLogin(username, password).then((resp) => {
      if ('error' in resp) {
        enqueueSnackbar('Network error', { variant: 'error' });
        if (resp.networkError) {
          dispatchAuthState({ type: 'error', payload: 'Network error' });
        }
        setIsError(true);
      } else {
        dispatchAuthState({
          type: 'login',
          payload: {
            token: resp.token,
            expires_at: new Date(resp.expires_at),
          },
        });
        navigate('/');
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <FormControl>
        <TextField
          variant="outlined"
          label="Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2, width: 300 }}
        />
        <TextField
          variant="outlined"
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={isError}
          helperText={
            isError ? authState.error ?? 'Username or password incorrect' : ''
          }
          sx={{ mb: 2 }}
        />
        <StyledButton
          variant="contained"
          type="submit"
          sx={{ mb: 1 }}
          disabled={password === '' || username === ''}
        >
          Log In
        </StyledButton>
      </FormControl>
    </form>
  );
}

function LoginPage(props: { create?: boolean }) {
  const [isNewAccount, setIsNewAccount] = useState(props.create ?? false);

  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <RoundedRectangle>
        {isNewAccount ? <CreateAccountForm /> : <LoginForm />}
        <StyledButton
          variant="outlined"
          onClick={() => setIsNewAccount(!isNewAccount)}
        >
          {isNewAccount ? 'Log In' : 'Create Account'}
        </StyledButton>
      </RoundedRectangle>
    </Box>
  );
}

export default LoginPage;
