import { ArrowBackIosNew, DataArray, Home, HourglassTop, ListAlt } from '@mui/icons-material'
import { Card, List, ListItem, ListItemButton, Stack } from '@mui/joy'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes, useLocation } from 'react-router-dom'
import SidebarLink from '../../components/sidebar-link'
import useIsMobile from '../../hooks/is_mobile'
import './admin.css'
import LogsPage from './logs'
import TablesPage from './tables'
import UnprocessedTracksPage from './unprocessed-tracks'

export default function AdminPage() {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  const location = useLocation()
  return (
    <Stack direction="row" width="100%" spacing={0}>
      <Card style={{ borderRadius: 0, padding: 0 }}>
        <List
          style={{
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s',
            minWidth: 0,
            height: '100%',
            width: 'fit-content',
          }}
          variant="soft"
        >
          <SidebarLink path="tables" label="Tables" icon={<DataArray />} collapsed={collapsed} />
          <SidebarLink path="logs" label="Logs" icon={<ListAlt />} collapsed={collapsed} />
          <SidebarLink
            path="unprocessed"
            label="Unprocessed"
            icon={<HourglassTop />}
            collapsed={collapsed}
          />

          <SidebarLink path="/" label="Home" icon={<Home />} collapsed={collapsed} />
          <div style={{ flex: 1 }} />
          <ListItem
            variant="soft"
            style={{
              height: 'fit-content',
            }}
          >
            <ListItemButton onClick={() => setCollapsed(!collapsed)} variant="soft">
              <ArrowBackIosNew
                style={{
                  rotate: collapsed ? '180deg' : '0deg',
                  transition: 'rotate 0.4s',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Card>
      <ErrorBoundary fallback={<div>Something went wrong</div>} resetKeys={[location]}>
        <Routes>
          <Route path="/tables" element={<TablesPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/unprocessed" element={<UnprocessedTracksPage />} />
        </Routes>
      </ErrorBoundary>
    </Stack>
  )
}
