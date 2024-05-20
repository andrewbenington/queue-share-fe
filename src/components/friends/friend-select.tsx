import { Person } from '@mui/icons-material'
import { Option, Select, Stack } from '@mui/joy'
import { useCallback, useContext, useEffect, useState } from 'react'
import { GetUserFriends, UserData } from '../../service/user'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { displayError } from '../../util/errors'

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
  }, [error, authState])

  useEffect(() => {
    if (!loading && !error && !friends && authState.access_token) {
      getUserFriends()
    }
  }, [loading, error, friends, authState])

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
      // MenuProps={{
      //   MenuListProps: {
      //     'aria-labelledby': 'basic-button',
      //     style: { backgroundColor: '#6663' },
      //   },
      // }}
    >
      <Option value={authState.userID}>
        <Stack direction="row">
          {authState.userSpotifyImageURL ? (
            <img
              style={{
                borderRadius: 5,
                width: 24,
                height: 24,
                marginRight: 10,
              }}
              src={authState.userSpotifyImageURL}
            />
          ) : (
            <div
              style={{
                borderRadius: 5,
                width: 36,
                height: 36,
                marginRight: 10,
                backgroundColor: 'grey',
              }}
            >
              <Person style={{ width: 24, height: 24, padding: 6 }} />
            </div>
          )}
          <div>{authState.userDisplayName}</div>
        </Stack>
      </Option>
      {friends?.map((friend) => (
        <Option value={friend.id}>
          <Stack direction="row">
            {friend.spotify_image_url ? (
              <img
                style={{
                  borderRadius: 5,
                  width: 24,
                  height: 24,
                  marginRight: 10,
                }}
                src={friend.spotify_image_url}
              />
            ) : (
              <div
                style={{
                  borderRadius: 5,
                  width: 36,
                  height: 36,
                  marginRight: 10,
                  backgroundColor: 'grey',
                }}
              >
                <Person style={{ width: 24, height: 24, padding: 6 }} />
              </div>
            )}
            <div>{friend.display_name}</div>
          </Stack>
        </Option>
      ))}
    </Select>
  )
}
