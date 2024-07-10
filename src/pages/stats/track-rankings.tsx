import { Add, Close, Person } from '@mui/icons-material'
import {
  Card,
  Chip,
  ChipDelete,
  IconButton,
  Input,
  Modal,
  ModalDialog,
  Option,
  Select,
  Stack,
} from '@mui/joy'
import dayjs from 'dayjs'
import { groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CollapsingProgress from '../../components/display/collapsing-progress'
import LoadingButton from '../../components/loading-button'
import RankingRow from '../../components/stats/ranking-row'
import { TrackRibbon } from '../../components/track-ribbon'
import {
  usePersistentIntQuery,
  usePersistentStringQuery,
  useStringListQuery,
} from '../../hooks/useQueryParam'
import { GetArtistsByURIs } from '../../service/artists'
import { GetTracksByTimeframe, TrackRanking, TrackRankings } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { ArtistData } from '../../types/spotify'
import { displayError } from '../../util/errors'
import { formatStreamsChange } from '../../util/format'
import { spotifyIDFromURI } from '../../util/spotify'
import SearchPage from './search'

export default function TrackRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [trackRankings, setTrackRankings] = useState<TrackRankings[]>()
  const [statsFriendState] = useContext(StatFriendContext)
  const [timeframe, setTimeframe] = usePersistentStringQuery('track_rank_timeframe', 'month')
  const [maxCount, setMaxCount] = usePersistentIntQuery('track_max_count', 10)

  const [searchParams] = useSearchParams()
  const [artistURIs, setArtistURIs] = useStringListQuery('artist_uris')
  const [albumURIs, setAlbumURIs] = useStringListQuery('album_uris')

  const [artists, setArtists] = useState<{ [id: string]: ArtistData }>({})

  const [artistModal, setArtistModal] = useState(false)

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token || !timeframe) return
    setLoading(true)
    const response = await GetTracksByTimeframe(
      authState.access_token,
      timeframe,
      maxCount,
      statsFriendState?.friend?.id,
      artistURIs,
      albumURIs ? albumURIs[0] : undefined
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setTrackRankings(response)
    if (artistURIs) {
      const resp = await GetArtistsByURIs(authState.access_token, artistURIs)
      if ('error' in resp && typeof resp.error === 'string') {
        displayError(resp.error)
        setError(resp.error)
        return
      }
      setArtists(resp as { [id: string]: ArtistData })
    }
    return
  }, [loading, error, authState, searchParams, statsFriendState, timeframe, maxCount])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, artistURIs, statsFriendState])

  const groupings = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return groupBy(trackRankings, (ranking) => {
          return ranking.startDate.add(-1, 'day').set('day', 1).format('YYYY-MM-DD')
        })
      case 'week':
        return groupBy(trackRankings, (ranking) => {
          return ranking.startDate.add(3, 'day').set('date', 1).format('YYYY-MM-DD')
        })
      default:
        return groupBy(trackRankings, (ranking) => {
          return ranking.startDate.year()
        })
    }
  }, [trackRankings])

  const displayRanking = useCallback(
    (ranking: TrackRanking) => (
      <TrackRibbon
        track={ranking.track}
        imageSize={48}
        cardVariant="outlined"
        rightComponent={
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              textAlign: 'right',
            }}
          >
            <b>x{ranking.stream_count}</b>
            {formatStreamsChange(ranking.streams_change)}
          </div>
        }
        link
      />
    ),
    []
  )

  useEffect(() => {
    fetchData()
  }, [timeframe])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <CollapsingProgress loading={loading} />
      <Stack>
        <Card variant="soft">
          <Stack direction="row">
            <Select
              value={timeframe}
              onChange={(_, val) => setTimeframe(val ?? 'month')}
              style={{ minWidth: 100 }}
            >
              <Option value="day">Day</Option>
              <Option value="week">Week</Option>
              <Option value="month">Month</Option>
              <Option value="year">Year</Option>
              <Option value="all_time">All Time</Option>
            </Select>
            <Input
              value={maxCount}
              type="number"
              style={{ maxWidth: 100 }}
              onChange={(e) => setMaxCount(e.target.value)}
            />
            <LoadingButton onClickAsync={fetchData}>Refresh</LoadingButton>
          </Stack>
          <div>Artist Filter:</div>
          <Stack direction="row">
            {artistURIs?.map((artistURI) => {
              return (
                <Chip
                  key={artistURI}
                  variant="plain"
                  startDecorator={
                    <img
                      width={32}
                      height={32}
                      style={{ borderRadius: 16, marginLeft: -6 }}
                      src={artists[spotifyIDFromURI(artistURI)]?.image_url}
                    />
                  }
                  endDecorator={
                    <ChipDelete
                      onDelete={() => setArtistURIs(artistURIs?.filter((uri) => uri !== artistURI))}
                    >
                      <Close />
                    </ChipDelete>
                  }
                >
                  {artists[spotifyIDFromURI(artistURI)]?.name}
                </Chip>
              )
            }) ?? <div>None</div>}
            <IconButton onClick={() => setArtistModal(true)}>
              <Add />
            </IconButton>
          </Stack>
          <div>Album Filter:</div>
          {albumURIs?.map((albumURI) => {
            return (
              <Chip
                key={albumURI}
                variant="plain"
                startDecorator={<Person />}
                endDecorator={
                  <ChipDelete
                    onDelete={() => setAlbumURIs(albumURIs?.filter((uri) => uri !== albumURI))}
                  >
                    <Close />
                  </ChipDelete>
                }
              >
                {albumURI}
              </Chip>
            )
          }) ?? <div>None</div>}
        </Card>
        <Stack>
          {Object.entries(groupings)
            .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
            .map(([start, ranks]) => {
              return ranks?.length ? (
                <RankingRow
                  key={start}
                  start={dayjs.utc(start)}
                  data={ranks}
                  displayRanking={displayRanking}
                  timeframe={timeframe ?? 'month'}
                />
              ) : (
                <div />
              )
            })}
        </Stack>
      </Stack>
      <Modal open={artistModal} onClose={() => setArtistModal(false)}>
        <ModalDialog>
          <SearchPage
            onSelect={(uri) => {
              if (!artistURIs?.includes(uri)) {
                setArtistURIs([...(artistURIs ?? []), uri])
              }
            }}
            lockedVariant="artist"
          />
        </ModalDialog>
      </Modal>
    </div>
  )
}
