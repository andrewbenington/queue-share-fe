import {
  Album,
  ArrowBackIosNew,
  ListAlt,
  MusicNote,
  Person,
  Search,
  TableChart,
} from '@mui/icons-material'
import { List, ListItemButton, Paper, Stack } from '@mui/material'
import { useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import SidebarLink from '../../components/sidebar-link'
import useIsMobile from '../../hooks/is_mobile'
import AlbumDetails from './album-details'
import AlbumRankingsPage from './album-rankings'
import ArtistDetails from './artist-details'
import ArtistRankingsPage from './artist-rankings'
import HistoryPage from './history'
import SearchPage from './search'
import SongStatsPage from './songs'
import YearlyTreeGraphPage from './stats-albums'
import TrackDetails from './track-details'
import SongRankingsPage from './track-rankings'

export default function StatsPage() {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  return (
    <Stack direction="row" width="100%" spacing={0}>
      <Paper style={{ borderRadius: 0 }}>
        <List
          style={{
            display: 'flex',
            flexDirection: 'column',
            transition: 'width 0.25s',
            width: 'fit-content',
            minWidth: 0,
            height: '100%',
          }}
        >
          <SidebarLink path="search" label="Search" icon={<Search />} collapsed={collapsed} />
          <SidebarLink
            path="year-tree"
            label="Yearly Tree Graph"
            icon={<TableChart />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="songs-by-month"
            label="Songs By Month"
            icon={<MusicNote />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="artists-by-month"
            label="Artists By Month"
            icon={<Person />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="albums-by-month"
            label="Albums By Month"
            icon={<Album />}
            collapsed={collapsed}
          />
          <SidebarLink path="history" label="History" icon={<ListAlt />} collapsed={collapsed} />
          <div style={{ flex: 1 }} />
          <ListItemButton
            disableRipple
            onClick={() => setCollapsed(!collapsed)}
            style={{ height: 'fit-content', flex: 0, marginBottom: 16 }}
          >
            <ArrowBackIosNew
              style={{
                rotate: collapsed ? '180deg' : '0deg',
                transition: 'rotate 0.4s',
                marginLeft: 'auto',
              }}
            />
          </ListItemButton>
        </List>
      </Paper>
      <Routes>
        <Route path="/year-tree" element={<YearlyTreeGraphPage />} />
        <Route path="/songs-by-year" element={<SongStatsPage />} />
        <Route path="/songs-by-month" element={<SongRankingsPage />} />
        <Route path="/artists-by-month" element={<ArtistRankingsPage />} />
        <Route path="/albums-by-month" element={<AlbumRankingsPage />} />
        <Route path="/track/:spotify_uri" element={<TrackDetails />} />
        <Route path="/artist/:spotify_uri" element={<ArtistDetails />} />
        <Route path="/album/:spotify_uri" element={<AlbumDetails />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Stack>
  )
}
