import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  Input,
  Stack,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import React, { useContext, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreateAccount, UserLogin } from '../service/user'
import { AuthContext } from '../state/auth'
import { displayError } from '../util/errors'

function CreateAccountForm() {
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [takenUsername, setTakenUsername] = useState('')
  const [, dispatchAuthState] = useContext(AuthContext)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    document.title = 'Create Account - Queue Share'
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    const submittedUsername = username
    CreateAccount(username, displayName, password).then((resp) => {
      if ('error' in resp) {
        if (resp.status === 409) {
          // username already in use
          setTakenUsername(submittedUsername)
        } else {
          displayError(resp.error)
          enqueueSnackbar(resp.error, { variant: 'error' })
          dispatchAuthState({ type: 'error', payload: resp.error })
        }
      } else {
        dispatchAuthState({
          type: 'login',
          payload: {
            token: resp.token,
            expires_at: new Date(resp.expires_at),
            user: resp.user,
          },
        })
        navigate(params.get('create_room') ? '/user?create_room=true' : '/')
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ width: 300, height: 260, display: 'grid', alignItems: 'center' }}
    >
      <FormControl>
        {params.get('create_room') && (
          <Alert color="danger" sx={{ mb: 2 }}>
            Log in or create an account to create a room.
          </Alert>
        )}
        <Input
          placeholder="Username"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={takenUsername !== '' && takenUsername === username}
          // helperText={
          //   takenUsername !== '' && takenUsername === username && `${takenUsername} is taken`
          // }
          sx={{ mb: 2, width: 300 }}
        />
        <Input
          placeholder="Display Name"
          id="display_name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Input
          placeholder="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Input
          placeholder="Confirm Password"
          id="confirm_password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={confirmPassword !== '' && confirmPassword !== password}
          // helperText={
          //   confirmPassword !== '' && confirmPassword !== password && 'Password must match'
          // }
          sx={{ mb: 1 }}
        />
        <Button
          type="submit"
          sx={{ mb: 1 }}
          disabled={password === '' || confirmPassword !== password}
        >
          Create
        </Button>
      </FormControl>
    </form>
  )
}

function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isError, setIsError] = useState(false)
  const [authState, dispatchAuthState] = useContext(AuthContext)
  const navigate = useNavigate()
  const [params] = useSearchParams()

  useEffect(() => {
    document.title = 'Log In - Queue Share'
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    UserLogin(username, password).then((resp) => {
      if ('error' in resp) {
        dispatchAuthState({ type: 'error', payload: resp.error })
        displayError(resp.error)
        setIsError(true)
      } else {
        dispatchAuthState({
          type: 'login',
          payload: {
            token: resp.token,
            user: resp.user,
            expires_at: new Date(resp.expires_at),
          },
        })
        navigate(
          params.get('create_room') && !resp.user.spotify_name ? '/user?create_room=true' : '/'
        )
      }
    })
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ width: 300, height: 260, display: 'grid', alignItems: 'center' }}
    >
      {params.get('create_room') && (
        <Alert color="danger" sx={{ mb: 2 }}>
          Log in or create an account to create a room.
        </Alert>
      )}
      <FormControl>
        <Stack>
          <Input
            placeholder="Username"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            sx={{ width: 300 }}
          />
          <div>
            <Input
              placeholder="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={isError}
            />
            {authState.error && (
              <aside
                style={{
                  color: '#cc0000',
                  fontWeight: 'bold',
                  fontSize: 14,
                  whiteSpace: 'wrap',
                  width: 250,
                }}
              >
                {authState.error}
              </aside>
            )}
          </div>
          <Button type="submit" sx={{ mb: 1 }} disabled={password === '' || username === ''}>
            Log In
          </Button>
        </Stack>
      </FormControl>
    </form>
  )
}

function LoginPage() {
  return (
    <Box display="flex" alignItems="center" justifyContent="center" flex={1}>
      <Card style={{ padding: 0 }}>
        <Tabs defaultValue="login" style={{ minHeight: 280 }}>
          <TabList variant="soft">
            <Tab variant="soft" value="login">
              Log In
            </Tab>
            <Tab variant="soft" value="create">
              Create Account
            </Tab>
          </TabList>
          <TabPanel value="login" variant="soft">
            <LoginForm />
          </TabPanel>
          <TabPanel value="create" variant="soft">
            <CreateAccountForm />
          </TabPanel>
        </Tabs>
      </Card>
    </Box>
  )
}

export default LoginPage
