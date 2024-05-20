import { LinkRounded } from '@mui/icons-material'
import ListItem from '@mui/material/ListItem/ListItem'
import ListItemButton from '@mui/material/ListItemButton/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon/ListItemIcon'
import ListItemText from '@mui/material/ListItemText/ListItemText'
import { Link, useLocation } from 'react-router-dom'

type SidebarLinkProps = {
  path: string
  prefix?: string
  label: string
  icon?: JSX.Element
  defaultPath?: boolean
  collapsed?: boolean
}

export default function SidebarLink(props: SidebarLinkProps) {
  const { path, prefix, label, icon, defaultPath, collapsed } = props
  const location = useLocation()
  return (
    <Link to={path}>
      <ListItem disablePadding>
        <ListItemButton
          disableRipple
          selected={
            path !== '/' &&
            (location.pathname.includes(prefix ?? path) ||
              (location.pathname === '/' && defaultPath))
          }
          style={{
            transition: 'width 4s, padding 0.4s, margin 0.4s',
          }}
          title={label}
        >
          <ListItemIcon>{icon ?? <LinkRounded />}</ListItemIcon>
          <ListItemText
            primary={label}
            style={{
              transition: 'width 0.4s, opacity 0.4s, padding 0.4s, margin 0.4s',
              width: collapsed ? 4 : 160,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              paddingLeft: collapsed ? 0 : 16,
            }}
          />
        </ListItemButton>
      </ListItem>
    </Link>
  )
}

type SidebarButtonProps = {
  label: string
  icon?: JSX.Element
  onClick?: () => void
  collapsed?: boolean
}

export function SidebarButton(props: SidebarButtonProps) {
  const { label, icon, onClick, collapsed } = props
  return (
    <ListItem disablePadding>
      <ListItemButton
        disableRipple
        style={{
          transition: 'width 4s, padding 0.4s, margin 0.4s',
        }}
        title={label}
        onClick={onClick}
      >
        <ListItemIcon>{icon ?? <LinkRounded />}</ListItemIcon>
        <ListItemText
          primary={label}
          style={{
            transition: 'width 0.4s, opacity 0.4s, padding 0.4s, margin 0.4s',
            width: collapsed ? 4 : 160,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            opacity: collapsed ? 0 : 1,
            paddingLeft: collapsed ? 0 : 16,
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}
