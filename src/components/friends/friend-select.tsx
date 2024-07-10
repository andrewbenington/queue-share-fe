import { Option, Select, Stack } from '@mui/joy'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { GetUserFriends, UserData } from '../../service/user'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'
import LoadingContainer from '../loading-container'
import UserIcon from './user-icon'

export default function FriendSelect() {
  const [authState] = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>()
  const [friends, setFriends] = useState<UserData[]>()
  const [statsFriendState, dispatchStatsFriendState] = useContext(StatFriendContext)

  const getUserFriends = useCallback(async () => {
    if (!authState.access_token) return
    setLoading(true)
    const response = await GetUserFriends(authState.access_token)
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setFriends(response)
  }, [authState])

  useEffect(() => {
    if (!error && authState.access_token) {
      getUserFriends()
    }
  }, [error, authState, getUserFriends])

  const userAndFriends: UserData[] = useMemo(() => {
    if (!authState.userID || !authState.userDisplayName || !authState.username) return []
    const all: UserData[] = [
      {
        id: authState.userID,
        spotify_image_url: authState.userSpotifyImageURL,
        display_name: authState.userDisplayName,
        username: authState.username,
      },
    ]
    if (friends) {
      all.push(...friends)
    }
    return all
  }, [
    authState.userDisplayName,
    authState.userID,
    authState.userSpotifyImageURL,
    authState.username,
    friends,
  ])

  return (
    <Select
      value={statsFriendState.friend?.id ?? authState.userID}
      onChange={(_, val) =>
        dispatchStatsFriendState({
          type: 'set',
          payload: friends?.find((friend) => friend.id === val),
        })
      }
      size="sm"
      renderValue={(opt) => {
        const user = userAndFriends.find((user) => user.id === opt?.value)
        if (!user) return ''
        return (
          <Stack direction="row" alignItems="center" spacing={1}>
            <UserIcon user={user} size={24} borderRadius={3} />
            <div>{user.display_name}</div>
          </Stack>
        )
      }}
      style={{ minWidth: 200 }}
    >
      <LoadingContainer loading={loading}>
        {userAndFriends.map((friend) => (
          <Option value={friend.id} style={{ borderRadius: 0 }}>
            <Stack direction="row">
              <UserIcon user={friend} size={24} />
              <div>{friend.display_name}</div>
            </Stack>
          </Option>
        ))}
      </LoadingContainer>
    </Select>
  )
}
