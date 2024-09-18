import { ListItem, ListItemButton, ListItemContent, ListItemDecorator } from '@mui/joy'
import { MdLink } from 'react-icons/md'
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
      <ListItem style={{ fontSize: 14 }}>
        <ListItemButton
          selected={
            path !== '/' &&
            (location.pathname.includes(prefix ?? path) ||
              (location.pathname === '/' && defaultPath))
          }
          style={{
            transition: 'width 0.2s, padding 0.2s, margin 0.2s',
          }}
          title={label}
          variant="soft"
        >
          <ListItemDecorator>{icon ?? <MdLink />}</ListItemDecorator>
          <ListItemContent
            style={{
              transition: 'width 0.2s, opacity 0.2s, padding 0.2s, margin 0.2s',
              width: collapsed ? 4 : 160,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              opacity: collapsed ? 0 : 1,
              paddingLeft: collapsed ? 0 : 16,
              paddingRight: collapsed ? 0 : 16,
            }}
          >
            {label}
          </ListItemContent>
        </ListItemButton>
      </ListItem>
    </Link>
  )
}
