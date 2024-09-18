import { Card, Container, IconButton, Input, Stack, Tab, TabList, Tabs, Typography } from '@mui/joy'
import { debounce } from 'lodash'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useState } from 'react'
import { MdAdd, MdSearch } from 'react-icons/md'
import { ArtistRibbon } from '../../components/artist-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import PlaylistDisplay from '../../components/player/playlist'
import { TrackRibbon } from '../../components/track-ribbon'
import { SearchArtists } from '../../service/artists'
import { SpotifyPlaylist, UserPlaylists } from '../../service/player_context'
import { SearchTracks } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { ArtistData, TrackData } from '../../types/spotify'
import { displayError } from '../../util/errors'

type Variant = 'artist' | 'album' | 'track' | 'playlist'
type SearchPageProps = {
  lockedVariant?: Variant
  onSelect?: (uri: string) => void
}

export default function SearchPage(props: SearchPageProps) {
  const { lockedVariant, onSelect } = props
  const [search, setSearch] = useState<string>('')
  const [results, setResults] = useState<(TrackData | ArtistData)[]>([])
  const [authState] = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [suggestedTracks] = useState<TrackData[]>()
  const [variant, setVariant] = useState<Variant>(lockedVariant ?? 'track')
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>()
  const [error, setError] = useState<string>()
  // const [noSuggestionsPermission, setNoSuggestionsPermission] = useState(false);
  // const isMobile = useIsMobile();

  // useEffect(() => {
  //   if (roomState?.code && !suggestedTracks && !loading) {
  //     SuggestedTracks(roomState.code, roomCredentials).then((res) => {
  //       if ("error" in res) {
  //         if (res.status === 403) {
  //           setNoSuggestionsPermission(true);
  //           return;
  //         }
  //         enqueueSnackbar(res.error, {
  //           variant: "error",
  //           autoHideDuration: 3000,
  //         });
  //         return;
  //       }
  //       setSuggestedTracks(res);
  //     });
  //   }
  // }, [suggestedTracks]);

  useEffect(() => {
    if (variant === 'playlist') return
    const storedSearch = localStorage.getItem(
      variant === 'track' ? 'last_search' : 'last_artist_search'
    )
    if (search === '' && storedSearch && storedSearch !== '') {
      setSearch(storedSearch)
    }
    if (!storedSearch || storedSearch === '') {
      localStorage.removeItem('last_search')
      localStorage.removeItem('last_search_results')
      localStorage.removeItem('last_artist_search')
      localStorage.removeItem('last_artist_search_results')
      setResults([])
    }
  }, [search, variant])

  useEffect(() => {
    const storedResults = localStorage.getItem(
      variant === 'track' ? 'last_search_results' : 'last_artist_search_results'
    )
    if (search === '' && storedResults && storedResults !== '') {
      setResults(JSON.parse(storedResults))
    }
  }, [search, variant])

  const getUserPlaylists = useCallback(() => {
    if (authState.access_token) {
      UserPlaylists(authState.access_token).then((res) => {
        if ('error' in res) {
          displayError(res.error)
          setError(res.error)
          return
        }
        setPlaylists(res.items)
      })
    }
  }, [authState.access_token])

  useEffect(() => {
    if (error || loading) return
    getUserPlaylists()
  }, [error, loading, getUserPlaylists])

  const getResults = useCallback(
    debounce(async (searchTerm) => {
      if (!authState.access_token || searchTerm.length < 2) {
        return
      }
      setLoading(true)
      const res =
        variant === 'track'
          ? await SearchTracks(authState.access_token, searchTerm)
          : await SearchArtists(authState.access_token, searchTerm)
      setLoading(false)
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      } else {
        setResults(res)
        localStorage.setItem(
          variant === 'track' ? 'last_search_results' : 'last_artist_search_results',
          JSON.stringify(res)
        )
      }
    }, 500),
    [authState, variant]
  )

  return (
    <Container style={{ overflow: 'auto' }}>
      {lockedVariant === undefined && (
        <Card
          style={{
            padding: 0,
            marginTop: 16,
            width: 'fit-content',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        >
          <Tabs
            onChange={(_, val) => {
              setResults([])
              setVariant(val as Variant)
              if (val === 'playlist') {
                setSearch('')
              }
            }}
          >
            <TabList>
              <Tab variant="soft" value="track">
                Track
              </Tab>
              <Tab variant="soft" value="artist">
                Artist
              </Tab>
              <Tab variant="soft" value="album">
                Album
              </Tab>
              <Tab variant="soft" value="playlist">
                Playlists
              </Tab>
            </TabList>
          </Tabs>
        </Card>
      )}
      <Input
        type="search"
        placeholder={variant === 'playlist' ? 'Filter Playlists' : 'Search Spotify'}
        value={search}
        startDecorator={<MdSearch />}
        onChange={(e) => {
          setSearch(e.target.value)
          if (variant === 'track' || variant === 'album') {
            localStorage.setItem(
              variant === 'track' ? 'last_search' : 'last_artist_search',
              e.target.value
            )
          }
          if (variant !== 'playlist') {
            getResults(e.target.value)
          }
        }}
        sx={{
          marginBottom: '10px',
          marginTop: '10px',
          width: '100%',
        }}
        variant="soft"
        // inputProps={{ style: { fontSize: 20 } }}
      />
      <CollapsingProgress loading={loading} />
      {results?.length ? <Typography>Results:</Typography> : <div />}
      {variant === 'track' ? (
        results?.map((track, i) => (
          <TrackRibbon key={`result_${i}`} track={track as TrackData} link imageSize={48} />
        ))
      ) : variant === 'artist' ? (
        results?.map((artist, i) => (
          <ArtistRibbon
            key={`result_${i}`}
            artist={artist as ArtistData}
            rightComponent={
              onSelect ? (
                <IconButton onClick={() => onSelect(artist.uri)}>
                  <MdAdd />
                </IconButton>
              ) : undefined
            }
            imageSize={48}
            cardVariant="outlined"
          />
        ))
      ) : variant === 'playlist' ? (
        <Stack spacing={1}>
          {playlists
            ?.filter((pl) => !search || pl.name.toUpperCase().includes(search.toUpperCase()))
            .map((pl) => (
              <Card style={{ padding: 0 }}>
                <PlaylistDisplay playlist={pl} queueable />
              </Card>
            ))}
        </Stack>
      ) : (
        <div />
      )}

      {(!results || results.length === 0) && (
        <>
          <Typography>Suggestions</Typography>
          {suggestedTracks?.map((track, i) => (
            <TrackRibbon key={`result_${i}`} track={track} link imageSize={48} />
          ))}
        </>
      )}
      {/* {noSuggestionsPermission && (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {roomState?.userIsHost
            ? "Re-link your Spotify account to allow track suggestions"
            : "Host must re-link their Spotify account to allow track suggestions"}
        </Alert>
      )} */}
    </Container>
  )
}
