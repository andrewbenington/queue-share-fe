import { Card, Stack } from '@mui/joy'
import { UserData } from '../../service/user'
import UserIcon from './user-icon'

export type UserDisplayProps = {
  user: UserData
  size: number
  borderRadius?: number
}

export default function UserDisplay(props: UserDisplayProps) {
  const { user, ...iconProps } = props
  return (
    <Card variant="outlined" style={{ padding: 4 }}>
      <Stack direction="row">
        <UserIcon user={user} {...iconProps} />
        <div>{user.display_name}</div>
      </Stack>
    </Card>
  )
}
