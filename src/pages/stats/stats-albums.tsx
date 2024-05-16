import { Card, Checkbox, MenuItem, Select, Stack, TextField } from '@mui/material'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import LoadingButton from '../../components/loading-button'
import LoadingContainer from '../../components/loading-container'
import ArtistsTree from '../../components/stats/yearly-tree-graph'
import { GetArtistsByYear, GetTracksByYear, StreamsByYear } from '../../service/stats'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import { Album, MusicNote, Person } from '@mui/icons-material'
import { GetAlbumsByYear } from '../../service/stats/albums'

type StreamType = 'track' | 'album' | 'artist'

export default function YearlyTreeGraphPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [minStreamSeconds, setMinStreamSeconds] = useState<number>(30)
  const [excludeSkips, setExcludeSkips] = useState(true)
  const [streamsByYear, setStreamsByYear] = useState<StreamsByYear>()
  const [streamType, setStreamType] = useState<StreamType>('artist')

  const fetchFunction = useMemo(() => {
    switch (streamType) {
      case 'track':
        return GetTracksByYear
      case 'album':
        return GetAlbumsByYear
      case 'artist':
        return GetArtistsByYear
    }
  }, [streamType])

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token) return
    const response = await fetchFunction(authState.access_token, minStreamSeconds, excludeSkips)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setStreamsByYear(response)
  }, [error, authState, minStreamSeconds, excludeSkips, fetchFunction])

  useEffect(() => {
    if (error || !authState.access_token || streamsByYear) return
    fetchData()
  }, [authState, error, streamsByYear])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchData()
  }, [streamType, error, authState])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Stack direction="row">
          <Select
            value={streamType}
            size="small"
            onChange={(e) => setStreamType(e.target.value as StreamType)}
          >
            <MenuItem value={'artist'}>
              <Stack direction="row">
                <Person />
                <div>Artist</div>
              </Stack>
            </MenuItem>
            <MenuItem value={'album'}>
              <Stack direction="row">
                <Album />
                <div>Album</div>
              </Stack>
            </MenuItem>
            <MenuItem value={'track'}>
              <Stack direction="row">
                <MusicNote />
                <div>Track</div>
              </Stack>
            </MenuItem>
          </Select>
          <TextField
            label={'Minimum Stream Time (seconds)'}
            type="number"
            value={minStreamSeconds}
            onChange={(e) => setMinStreamSeconds(parseFloat(e.target.value))}
          />
          <label>
            Exclude Skips
            <Checkbox checked={excludeSkips} onChange={(e) => setExcludeSkips(e.target.checked)} />
          </label>
          <LoadingButton onClickAsync={fetchData}>Reload</LoadingButton>
        </Stack>
      </Card>
      <LoadingContainer loading={!streamsByYear}>
        {streamsByYear &&
          Object.entries(streamsByYear)
            .sort(([yearA], [yearB]) => parseInt(yearB) - parseInt(yearA))
            .map(([year, streamData]) => {
              return streamData.length ? (
                <ArtistsTree key={year} year={parseInt(year)} data={streamData} />
              ) : (
                <div />
              )
            })}
      </LoadingContainer>
    </div>
  )
}
