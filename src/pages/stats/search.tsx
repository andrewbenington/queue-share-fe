import { Search } from '@mui/icons-material'
import { Container, Input, Typography } from '@mui/joy'
import { debounce } from 'lodash'
import { enqueueSnackbar } from 'notistack'
import { useCallback, useContext, useEffect, useState } from 'react'
import CollapsingProgress from '../../components/collapsing-progress'
import { TrackRibbon } from '../../components/track-ribbon'
import useIsMobile from '../../hooks/is_mobile'
import { SearchTracks } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { TrackData } from '../../types/spotify'

export default function SearchPage() {
  const [search, setSearch] = useState<string>('')
  const [results, setResults] = useState<TrackData[]>([])
  const [authState] = useContext(AuthContext)
  const [loading, setLoading] = useState(false)
  const [suggestedTracks] = useState<TrackData[]>()
  const isMobile = useIsMobile()
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
    const storedSearch = localStorage.getItem('last_search')
    if (search === '' && storedSearch && storedSearch !== '') {
      setSearch(storedSearch)
    }
    if (!storedSearch || storedSearch === '') {
      localStorage.removeItem('last_search')
      localStorage.removeItem('last_search_results')
      setResults([])
    }
  }, [search])

  useEffect(() => {
    const storedResults = localStorage.getItem('last_search_results')
    if (search === '' && storedResults && storedResults !== '') {
      setResults(JSON.parse(storedResults))
    }
  }, [search])

  const getResults = useCallback(
    debounce(async (searchTerm) => {
      if (!authState.access_token || searchTerm.length < 2) {
        return
      }
      setLoading(true)
      const res = await SearchTracks(authState.access_token, searchTerm)
      setLoading(false)
      if ('error' in res) {
        enqueueSnackbar(res.error, {
          variant: 'error',
          autoHideDuration: 3000,
        })
        return
      } else {
        setResults(res)
        localStorage.setItem('last_search_results', JSON.stringify(res))
      }
    }, 500),
    []
  )

  return (
    <Container style={{ maxWidth: isMobile ? '80%' : '50%', overflow: 'auto' }}>
      <Input
        type="search"
        placeholder="Search Spotify"
        value={search}
        startDecorator={<Search />}
        onChange={(e) => {
          setSearch(e.target.value)
          localStorage.setItem('last_search', e.target.value)
          getResults(e.target.value)
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
      {results?.map((track, i) => (
        <TrackRibbon key={`result_${i}`} song={track} link imageSize={48} />
      ))}

      {(!results || results.length === 0) && (
        <>
          <Typography>Suggestions</Typography>
          {suggestedTracks?.map((track, i) => (
            <TrackRibbon key={`result_${i}`} song={track} link imageSize={48} />
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
