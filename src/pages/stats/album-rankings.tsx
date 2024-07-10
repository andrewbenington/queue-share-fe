import { Card, Chip, Input, Option, Select, Stack } from '@mui/joy'
import dayjs from 'dayjs'
import { groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlbumRibbon } from '../../components/album-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import LoadingButton from '../../components/loading-button'
import RankingRow from '../../components/stats/ranking-row'
import StreamCountModal from '../../components/stats/stream-count-modal'
import { usePersistentIntQuery, usePersistentStringQuery } from '../../hooks/useQueryParam'
import { AlbumRanking, AlbumRankings, GetAlbumsByTimeframe } from '../../service/stats/albums'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'
import { formatStreamsChange } from '../../util/format'

export default function AlbumRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [albumRankings, setAlbumRankings] = useState<AlbumRankings[]>()
  const [statsFriendState] = useContext(StatFriendContext)
  const [timeframe, setTimeframe] = usePersistentStringQuery('album_rank_timeframe', 'month')
  const [maxCount, setMaxCount] = usePersistentIntQuery('album_max_count', 10)
  const [selected, setSelected] = useState<AlbumRanking>()

  const [searchParams] = useSearchParams()

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetAlbumsByTimeframe(
      authState.access_token,
      timeframe,
      maxCount,
      statsFriendState.friend?.id,
      searchParams.get('artist_uri') ?? undefined
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setAlbumRankings(response)
    return
  }, [loading, error, authState, statsFriendState.friend?.id, maxCount, timeframe])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, statsFriendState])

  const groupings = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return groupBy(albumRankings, (ranking) => {
          return ranking.startDate.add(-1, 'day').set('day', 1)
        })
      case 'week':
        return groupBy(albumRankings, (ranking) => {
          return ranking.startDate.set('date', 1).add(1, 'day')
        })
      default:
        return groupBy(albumRankings, (ranking) => {
          return ranking.startDate.year()
        })
    }
  }, [albumRankings])

  useEffect(() => {
    fetchData()
  }, [timeframe])

  const displayRanking = useCallback(
    (ranking: AlbumRanking) => (
      <AlbumRibbon
        album={ranking.album}
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
            <Chip onClick={() => setSelected(ranking)} variant="plain" size="sm">
              x{ranking.stream_count}
            </Chip>
            {formatStreamsChange(ranking.streams_change)}
          </div>
        }
      />
    ),
    []
  )

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 8 }}>
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
              <Option value="all time">All Time</Option>
            </Select>
            <Input
              value={maxCount}
              type="number"
              style={{ maxWidth: 100 }}
              onChange={(e) => setMaxCount(e.target.value)}
            />
            <LoadingButton onClickAsync={fetchData}>Refresh</LoadingButton>
          </Stack>
        </Card>
        <Stack spacing={1}>
          {Object.entries(groupings)
            .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
            .map(([start, ranks]) => {
              return ranks?.length ? (
                <RankingRow
                  key={start}
                  start={dayjs.utc(start)}
                  data={ranks}
                  displayRanking={displayRanking}
                  timeframe={timeframe}
                />
              ) : (
                <div />
              )
            })}
        </Stack>
      </Stack>
      <StreamCountModal
        title={selected?.album.name}
        trackURIs={selected?.tracks}
        onClose={() => setSelected(undefined)}
      />
    </div>
  )
}
