import { Button, Card, IconButton, List, ListItem, ListItemButton, Stack } from '@mui/joy'
import { enqueueSnackbar } from 'notistack'
import { useContext, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { BiLoader } from 'react-icons/bi'
import {
  MdAlbum,
  MdArrowBackIosNew,
  MdCompareArrows,
  MdDelete,
  MdListAlt,
  MdMusicNote,
  MdPerson,
  MdSearch,
  MdTableChart,
  MdTrendingUp,
} from 'react-icons/md'
import { Route, Routes, useLocation } from 'react-router-dom'
import { AlbumRibbon } from '../../components/album-ribbon'
import { ArtistRibbon } from '../../components/artist-ribbon'
import LoadingButton from '../../components/loading-button'
import PlaylistDisplay from '../../components/player/playlist'
import SidebarLink from '../../components/sidebar-link'
import useIsMobile from '../../hooks/is_mobile'
import { BuildQueue } from '../../service/queue'
import { AuthContext } from '../../state/auth'
import { BuilderContext } from '../../state/builder'
import { displayError } from '../../util/errors'
import AlbumDetails from './album-details'
import AlbumRankingsPage from './album-rankings'
import ArtistDetails from './artist-details'
import ArtistRankingsPage from './artist-rankings'
import ComparePage from './compare'
import HistoryPage from './history'
import NewPage from './new'
import SearchPage from './search'
import SongStatsPage from './songs'
import TrackDetails from './track-details'
import TrackRankingsPage from './track-rankings'
import UpdatesPage from './updates'
import YearlyTreeGraphPage from './yearly-tree-graph'

export default function StatsPage() {
  const isMobile = useIsMobile()
  const [collapsed, setCollapsed] = useState(isMobile)
  const [builderState, dispatchBuilderState] = useContext(BuilderContext)
  const [authState] = useContext(AuthContext)
  const location = useLocation()

  return (
    <Stack direction="row" width="100%" spacing={0}>
      <Card style={{ borderRadius: 0, padding: 0 }}>
        <List
          className="pink-svgs"
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
          <SidebarLink path="search" label="Search" icon={<MdSearch />} collapsed={collapsed} />
          <SidebarLink path="new" label="New" icon={<BiLoader />} collapsed={collapsed} />
          <SidebarLink
            path="updates"
            label="Updates"
            icon={<MdTrendingUp />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="compare"
            label="Compare"
            icon={<MdCompareArrows />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="year-tree"
            label="Yearly Tree Graph"
            icon={<MdTableChart />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="track-rankings"
            label="Track Rankings"
            icon={<MdMusicNote />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="artist-rankings"
            label="Artist Rankings"
            icon={<MdPerson />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="album-rankings"
            label="Album Rankings"
            icon={<MdAlbum />}
            collapsed={collapsed}
          />
          <SidebarLink path="history" label="History" icon={<MdListAlt />} collapsed={collapsed} />
          <div style={{ flex: 1 }} />
          <ListItem
            variant="soft"
            style={{
              height: 'fit-content',
            }}
          >
            <ListItemButton onClick={() => setCollapsed(!collapsed)} variant="soft">
              <MdArrowBackIosNew
                style={{
                  rotate: collapsed ? '180deg' : '0deg',
                  transition: 'rotate 0.4s',
                }}
              />
            </ListItemButton>
          </ListItem>
        </List>
      </Card>
      {Object.keys(builderState.artist_ids).length ||
      Object.keys(builderState.album_ids).length ||
      Object.keys(builderState.playlist_ids).length ? (
        <Card
          style={{
            position: 'absolute',
            bottom: 8,
            right: 8,
            zIndex: 2,
            width: 280,
            padding: 8,
            maxHeight: 400,
            overflowY: 'auto',
          }}
          variant="plain"
          className="floating-card"
        >
          <div style={{ overflowY: 'auto' }}>
            <Stack spacing={1}>
              {Object.values(builderState.album_ids).map((album) => (
                <AlbumRibbon
                  album={album}
                  compact
                  imageSize={36}
                  cardVariant="soft"
                  rightComponent={
                    <IconButton
                      color="danger"
                      variant="plain"
                      onClick={() =>
                        dispatchBuilderState({
                          type: 'remove_id',
                          payload: { type: 'album', id: album.id },
                        })
                      }
                    >
                      <MdDelete />
                    </IconButton>
                  }
                />
              ))}
              {Object.values(builderState.artist_ids).map((artist) => (
                <ArtistRibbon
                  artist={artist}
                  compact
                  imageSize={36}
                  cardVariant="soft"
                  rightComponent={
                    <IconButton
                      color="danger"
                      variant="plain"
                      onClick={() =>
                        dispatchBuilderState({
                          type: 'remove_id',
                          payload: { type: 'artist', id: artist.id },
                        })
                      }
                    >
                      <MdDelete />
                    </IconButton>
                  }
                />
              ))}
              {Object.values(builderState.playlist_ids)?.map((playlist) => (
                <Card
                  variant="soft"
                  style={{
                    padding: 0,
                    display: 'flex',
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    overflow: 'hidden',
                  }}
                >
                  <PlaylistDisplay playlist={playlist} queueable imageSize={36} />
                  <IconButton
                    color="danger"
                    variant="plain"
                    onClick={() =>
                      dispatchBuilderState({
                        type: 'remove_id',
                        payload: { type: 'playlist', id: playlist.id },
                      })
                    }
                  >
                    <MdDelete />
                  </IconButton>
                </Card>
              ))}
            </Stack>
          </div>
          <Stack direction="row">
            <Button
              onClick={() => {
                dispatchBuilderState({ type: 'clear' })
              }}
            >
              Clear
            </Button>
            <LoadingButton
              onClickAsync={async () => {
                const response = await BuildQueue(authState.access_token ?? '', {
                  artist_ids: Object.keys(builderState.artist_ids),
                  album_ids: Object.keys(builderState.album_ids),
                  playlist_ids: Object.keys(builderState.playlist_ids),
                })
                if (response && 'error' in response) {
                  displayError(response.error)
                  return
                }
                enqueueSnackbar('Success', { variant: 'success' })
                dispatchBuilderState({ type: 'clear' })
              }}
            >
              Enqueue
            </LoadingButton>
          </Stack>
        </Card>
      ) : undefined}
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
          <Route path="/updates" element={<UpdatesPage />} />
          <Route path="/new" element={<NewPage />} />
        </Routes>
      </ErrorBoundary>
    </Stack>
  )
}
