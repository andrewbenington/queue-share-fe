import { Add, Check, Delete, Person } from '@mui/icons-material'
import { Button, CircularProgress, Stack, SvgIconTypeMap, Tab, Tabs } from '@mui/material'
import { OverridableComponent } from '@mui/material/OverridableComponent'
import { useCallback, useContext, useEffect, useState } from 'react'
import {
  DeleteFriendRequest,
  FriendReqData,
  GetFriendReqData,
  OtherUser,
  SendFriendRequest,
} from '../../service/user'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import LoadingContainer from '../loading-container'

export function FriendPanel() {
  const [authState] = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [reqData, setReqData] = useState<FriendReqData>()
  const [tab, setTab] = useState<'sent' | 'received' | 'suggestions'>('sent')

  const getAllUsers = useCallback(async () => {
    if (error || !authState.access_token) return
    setLoading(true)
    const response = await GetFriendReqData(authState.access_token)
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setReqData(response)
  }, [error, authState])

  useEffect(() => {
    if (error || loading || !authState.access_token || reqData) return
    getAllUsers()
  }, [authState, error, loading, reqData])

  return (
    <LoadingContainer loading={loading}>
      <Tabs onChange={(_, val) => setTab(val)} value={tab}>
        <Tab value="suggestions" label="Suggestions" />
        <Tab value="sent" label="Sent" />
        <Tab value="received" label="Received" />
      </Tabs>
      {tab === 'suggestions' ? (
        <FriendSuggestions suggestions={reqData?.suggestions} />
      ) : tab === 'sent' ? (
        <SentFriendRequests requests={reqData?.sent_requests} />
      ) : (
        <SentFriendRequests requests={reqData?.received_requests} />
      )}
    </LoadingContainer>
  )
}

export type FriendSuggestionsProps = {
  suggestions?: OtherUser[]
}

export function FriendSuggestions(props: FriendSuggestionsProps) {
  const { suggestions } = props

  return <Stack>{suggestions?.map((user) => <FriendSuggestion user={user} />)}</Stack>
}

export type SentFriendRequestsProps = {
  requests?: OtherUser[]
}

export function SentFriendRequests(props: SentFriendRequestsProps) {
  const { requests } = props

  return <Stack>{requests?.map((user) => <SentFriendRequest user={user} />)}</Stack>
}

export type FriendRequestProps = {
  user: OtherUser
}

export function SentFriendRequest(props: FriendRequestProps) {
  const { user } = props
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [deleted, setDeleted] = useState(false)

  const deleteFriendRequest = useCallback(async () => {
    if (error || !authState.access_token) return
    setLoading(true)
    const response = await DeleteFriendRequest(authState.access_token, user.id)
    setLoading(false)
    if (response && 'error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setDeleted(true)
  }, [error, authState])

  return (
    <FriendRequestRibbon
      loading={loading}
      added={deleted}
      sendRequest={deleteFriendRequest}
      disabled={!!error}
      icon={Delete}
      user={user}
    />
  )
}

export function FriendSuggestion(props: FriendRequestProps) {
  const { user } = props
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [added, setAdded] = useState(false)

  const sendFriendRequest = useCallback(async () => {
    if (error || !authState.access_token) return
    setLoading(true)
    const response = await SendFriendRequest(authState.access_token, user.id)
    setLoading(false)
    if (response && 'error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setAdded(true)
  }, [error, authState])

  return (
    <FriendRequestRibbon
      loading={loading}
      added={added}
      sendRequest={sendFriendRequest}
      disabled={!!error}
      icon={Add}
      user={user}
    />
  )
}

export type FriendRequestRibbonProps = {
  user: OtherUser
  added: boolean
  loading: boolean
  disabled?: boolean
  sendRequest: () => void
  icon: OverridableComponent<SvgIconTypeMap>
}

export function FriendRequestRibbon(props: FriendRequestRibbonProps) {
  const { added, loading, disabled, sendRequest, icon: Icon, user } = props

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 8,
        margin: 8,
        borderRadius: 5,
        backgroundColor: '#222',
        maxWidth: '100%',
      }}
    >
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        {user.spotify_image_url ? (
          <img
            style={{
              borderRadius: 5,
              width: 48,
              height: 48,
              marginRight: 10,
            }}
            src={user.spotify_image_url}
          />
        ) : (
          <div
            style={{
              borderRadius: 5,
              width: 48,
              height: 48,
              marginRight: 10,
              backgroundColor: 'grey',
            }}
          >
            <Person style={{ width: 36, height: 36, padding: 6 }} />
          </div>
        )}
        <Stack spacing={0}>
          <div>{user.display_name}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>{user.username}</div>
        </Stack>
      </div>
      {added ? (
        <Check style={{ color: '#00ff00', marginRight: 8, marginTop: 12 }} />
      ) : loading ? (
        <CircularProgress size={20} style={{ marginRight: 8 }} />
      ) : (
        <Button
          onClick={sendRequest}
          disabled={disabled}
          variant="outlined"
          style={{ minWidth: 32, height: 32, padding: 0 }}
          color="secondary"
        >
          <Icon />
        </Button>
      )}
    </div>
  )
  return
}
