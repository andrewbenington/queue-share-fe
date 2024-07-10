import { Cancel, CheckCircle, Delete, PersonAdd } from '@mui/icons-material'
import { Badge, Dropdown, Menu, MenuButton, Stack, Tab, TabList, Tabs } from '@mui/joy'
import { useCallback, useContext, useEffect, useState } from 'react'
import {
  AcceptFriendRequest,
  DeleteFriendRequest,
  FriendReqData,
  GetFriendReqData,
  SendFriendRequest,
  UserData,
} from '../../service/user'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import LoadingContainer from '../loading-container'
import { FriendRibbon } from './friend-ribbon'

type TabValue = 'sent' | 'received' | 'suggestions'

export function FriendPanel() {
  const [authState] = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [reqData, setReqData] = useState<FriendReqData>()
  const [tab, setTab] = useState<TabValue>('suggestions')

  const getReqData = useCallback(async () => {
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
    getReqData()
  }, [authState, error, loading, reqData])

  return (
    <>
      <Badge
        badgeContent={reqData?.received_requests?.length ?? 0}
        color="danger"
        style={{ marginTop: 'auto', marginBottom: 'auto', marginRight: 16 }}
      >
        <Dropdown>
          <MenuButton
            id="basic-button"
            aria-haspopup="true"
            variant="outlined"
            color="primary"
            style={{ borderRadius: 30, padding: 4, minWidth: 32, minHeight: 32, height: 32 }}
          >
            <PersonAdd />
          </MenuButton>
          <Menu style={{ paddingTop: 0 }} variant="plain">
            <LoadingContainer loading={false}>
              <Tabs
                onChange={(_, val) => {
                  setTab(val as TabValue)
                  getReqData()
                }}
                value={tab}
                color="neutral"
                variant="outlined"
              >
                <TabList>
                  <Tab value="suggestions">Suggestions</Tab>
                  <Tab value="sent">Sent</Tab>
                  <Tab value="received">Received</Tab>
                </TabList>
              </Tabs>
              <Stack>
                {tab === 'suggestions'
                  ? reqData?.suggestions?.map((user) => (
                      <FriendSuggestion user={user} refreshData={getReqData} />
                    ))
                  : tab === 'sent'
                    ? reqData?.sent_requests?.map((user) => (
                        <SentFriendRequest user={user} refreshData={getReqData} />
                      ))
                    : reqData?.received_requests?.map((user) => (
                        <ReceivedFriendRequest user={user} refreshData={getReqData} />
                      ))}
              </Stack>
            </LoadingContainer>
          </Menu>
        </Dropdown>
      </Badge>
    </>
  )
}

export type FriendRequestProps = {
  user: UserData
  refreshData: () => Promise<void>
}

export function SentFriendRequest(props: FriendRequestProps) {
  const { user, refreshData } = props
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [, setDeleted] = useState(false)

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
    await refreshData()
  }, [error, authState])

  return (
    <FriendRibbon
      loading={loading}
      success={false}
      icon1Click={deleteFriendRequest}
      disabled={!!error}
      icon1={Delete}
      icon1Color="danger"
      user={user}
    />
  )
}

export function ReceivedFriendRequest(props: FriendRequestProps) {
  const { user, refreshData } = props
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

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
    setSuccess(true)
    await refreshData()
  }, [error, authState])

  const acceptFriendRequest = useCallback(async () => {
    if (error || !authState.access_token) return
    setLoading(true)
    const response = await AcceptFriendRequest(authState.access_token, user.id)
    setLoading(false)
    if (response && 'error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setSuccess(true)
  }, [error, authState])

  return (
    <FriendRibbon
      loading={loading}
      success={success}
      disabled={!!error}
      icon1={Cancel}
      icon1Click={deleteFriendRequest}
      icon1Color="danger"
      user={user}
      icon2={CheckCircle}
      icon2Click={acceptFriendRequest}
      icon2Color="success"
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
    // await refreshData()
  }, [error, authState])

  return (
    <FriendRibbon
      loading={loading}
      success={added}
      icon1Click={sendFriendRequest}
      disabled={!!error}
      icon1={PersonAdd}
      icon1Color="neutral"
      user={user}
    />
  )
}
