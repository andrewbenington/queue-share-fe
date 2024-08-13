import {
  Album,
  ArrowBackIosNew,
  CompareArrows,
  Event,
  ListAlt,
  MusicNote,
  Person,
  Search,
  TableChart,
} from '@mui/icons-material'
import { Card, List, ListItem, ListItemButton, Stack } from '@mui/joy'
import { useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Route, Routes, useLocation } from 'react-router-dom'
import SidebarLink from '../../components/sidebar-link'
import useIsMobile from '../../hooks/is_mobile'
import AlbumDetails from './album-details'
import AlbumRankingsPage from './album-rankings'
import ArtistDetails from './artist-details'
import ArtistRankingsPage from './artist-rankings'
import ComparePage from './compare'
import EventsPage from './events'
import HistoryPage from './history'
import SearchPage from './search'
import SongStatsPage from './songs'
import TrackDetails from './track-details'
import TrackRankingsPage from './track-rankings'
import YearlyTreeGraphPage from './yearly-tree-graph'

export default function StatsPage() {
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
          <SidebarLink path="search" label="Search" icon={<Search />} collapsed={collapsed} />
          <SidebarLink path="events" label="Events" icon={<Event />} collapsed={collapsed} />
          <SidebarLink
            path="compare"
            label="Compare"
            icon={<CompareArrows />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="year-tree"
            label="Yearly Tree Graph"
            icon={<TableChart />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="track-rankings"
            label="Track Rankings"
            icon={<MusicNote />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="artist-rankings"
            label="Artist Rankings"
            icon={<Person />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="album-rankings"
            label="Album Rankings"
            icon={<Album />}
            collapsed={collapsed}
          />
          <SidebarLink path="history" label="History" icon={<ListAlt />} collapsed={collapsed} />
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
          <Route path="/year-tree" element={<YearlyTreeGraphPage />} />
          <Route path="/songs-by-year" element={<SongStatsPage />} />
          <Route path="/track-rankings" element={<TrackRankingsPage />} />
          <Route path="/artist-rankings" element={<ArtistRankingsPage />} />
          <Route path="/album-rankings" element={<AlbumRankingsPage />} />
          <Route path="/track/:spotify_uri" element={<TrackDetails />} />
          <Route path="/artist/:spotify_uri" element={<ArtistDetails />} />
          <Route path="/album/:spotify_uri" element={<AlbumDetails />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/events" element={<EventsPage />} />
        </Routes>
      </ErrorBoundary>
    </Stack>
  )
}
