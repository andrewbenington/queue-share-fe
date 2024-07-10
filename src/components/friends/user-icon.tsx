import { UserData } from '../../service/user'
import { userColor } from '../../util/color'

export type UserIconProps = {
  user: UserData
  size: number
  borderRadius?: number
}

export default function UserIcon(props: UserIconProps) {
  const { user, size, borderRadius } = props
  return user.spotify_image_url ? (
    <img
      style={{
        borderRadius: borderRadius ?? 5,
        width: size,
        height: size,
      }}
      src={user.spotify_image_url}
    />
  ) : (
    <div
      style={{
        borderRadius: borderRadius ?? 5,
        width: size,
        height: size,
        backgroundColor: userColor(user.id),
      }}
    >
      {/* <Person style={{ width: size - 6, height: size - 6, padding: 3 }} /> */}
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.5,
          fontWeight: 'bold',
        }}
      >
        {user.display_name
          .split(' ')
          .map((str) => str[0])
          .join('')}
      </div>
    </div>
  )
}
