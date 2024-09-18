import { Card, Option, Select, Stack } from '@mui/joy'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { MdAlbum, MdMusicNote, MdPerson } from 'react-icons/md'
import LoadingButton from '../../components/loading-button'
import LoadingContainer from '../../components/loading-container'
import CountTreeGraph from '../../components/stats/yearly-tree-graph'
import { AlbumRankings, GetAlbumsByTimeframe } from '../../service/stats/albums'
import { ArtistRankings, GetArtistsByTimeframe } from '../../service/stats/artists'
import { GetTracksByTimeframe, TrackRankings } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'

type StreamType = 'track' | 'album' | 'artist'

export default function YearlyTreeGraphPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [streamsByYear, setStreamsByYear] = useState<
    TrackRankings[] | ArtistRankings[] | AlbumRankings[]
  >()
  const [streamType, setStreamType] = useState<StreamType>('artist')
  const [statsFriendState] = useContext(StatFriendContext)

  const fetchFunction = useMemo(() => {
    switch (streamType) {
      case 'track':
        return GetTracksByTimeframe
      case 'album':
        return GetAlbumsByTimeframe
      case 'artist':
        return GetArtistsByTimeframe
    }
  }, [streamType])

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token) return
    const response = await fetchFunction(
      authState.access_token,
      'year',
      50,
      undefined,
      undefined,
      statsFriendState.friend?.id
    )
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setStreamsByYear(response)
  }, [error, authState.access_token, fetchFunction, statsFriendState.friend?.id])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <Card style={{ marginBottom: 16 }}>
        <Stack direction="row">
          <Select
            value={streamType}
            size="sm"
            onChange={(_, val) => setStreamType(val as StreamType)}
          >
            <Option value={'artist'}>
              <Stack direction="row">
                <MdPerson />
                <div>Artist</div>
              </Stack>
            </Option>
            <Option value={'album'}>
              <Stack direction="row">
                <MdAlbum />
                <div>Album</div>
              </Stack>
            </Option>
            <Option value={'track'}>
              <Stack direction="row">
                <MdMusicNote />
                <div>Track</div>
              </Stack>
            </Option>
          </Select>
          <LoadingButton onClickAsync={fetchData}>Reload</LoadingButton>
        </Stack>
      </Card>
      <LoadingContainer loading={!streamsByYear}>
        {streamsByYear &&
          streamsByYear
            .sort((a, b) => b.startDate.diff(a.startDate))
            .map((rankings) => {
              return rankings.rankings.length ? (
                <CountTreeGraph
                  key={rankings.startDate.toString()}
                  year={rankings.startDate.year()}
                  data={rankings.rankings}
                />
              ) : (
                <div />
              )
            })}
      </LoadingContainer>
    </div>
  )
}
