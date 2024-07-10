import { Check, SvgIconComponent } from '@mui/icons-material'
import { Button, Card, CircularProgress, ColorPaletteProp, Stack } from '@mui/joy'
import { UserData } from '../../service/user'
import UserIcon from './user-icon'

export type FriendRibbonProps = {
  user: UserData
  success: boolean
  loading: boolean
  disabled?: boolean
  icon1Click: () => void
  icon1: SvgIconComponent
  icon1Color: ColorPaletteProp
  icon2Click?: () => void
  icon2?: SvgIconComponent
  icon2Color?: ColorPaletteProp
}

export function FriendRibbon(props: FriendRibbonProps) {
  const {
    user,
    success,
    loading,
    disabled,
    icon1Click,
    icon1: Icon1,
    icon1Color,
    icon2Click,
    icon2: Icon2,
    icon2Color,
  } = props

  return (
    <Card
      style={{
        display: 'flex',
        flexDirection: 'row',
        padding: 8,
        margin: 8,
        maxWidth: '100%',
        alignItems: 'center',
      }}
    >
      <Stack direction="row" width="100%" alignItems="center">
        <UserIcon user={user} size={48} />
        <Stack spacing={0} flex={1}>
          <div>{user.display_name}</div>
          <div style={{ fontSize: 14, opacity: 0.8 }}>{user.username}</div>
        </Stack>
        {success ? (
          <Check style={{ minWidth: 32, height: 32, padding: 0 }} />
        ) : loading ? (
          <CircularProgress size="sm" style={{ marginRight: 8 }} />
        ) : (
          <div>
            <Button
              onClick={icon1Click}
              disabled={disabled}
              variant="outlined"
              style={{
                minWidth: 32,
                height: 32,
                padding: 0,
                borderTopRightRadius: Icon2 ? 0 : undefined,
                borderBottomRightRadius: Icon2 ? 0 : undefined,
              }}
              color={icon1Color}
            >
              <Icon1 />
            </Button>
            {icon2Click && Icon2 ? (
              <Button
                onClick={icon2Click}
                disabled={disabled}
                variant="outlined"
                style={{
                  minWidth: 32,
                  height: 32,
                  padding: 0,
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                }}
                color={icon2Color}
              >
                <Icon2 />
              </Button>
            ) : (
              <div />
            )}
          </div>
        )}
      </Stack>
    </Card>
  )
}
