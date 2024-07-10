import { Card, Chip, Input, Option, Select, Stack } from '@mui/joy'
import dayjs from 'dayjs'
import { debounce, groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { ArtistRibbon } from '../../components/artist-ribbon'
import CollapsingProgress from '../../components/display/collapsing-progress'
import LoadingButton from '../../components/loading-button'
import RankingRow from '../../components/stats/ranking-row'
import StreamCountModal from '../../components/stats/stream-count-modal'
import { usePersistentIntQuery, usePersistentStringQuery } from '../../hooks/useQueryParam'
import { ArtistRanking, ArtistRankings, GetArtistsByTimeframe } from '../../service/stats/artists'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { displayError } from '../../util/errors'
import { formatStreamsChange } from '../../util/format'

export default function ArtistRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [artistRankings, setArtistRankings] = useState<ArtistRankings[]>()
  const [statsFriendState] = useContext(StatFriendContext)
  const [timeframe, setTimeframe] = usePersistentStringQuery('artist_rank_timeframe', 'month')
  const [maxCount, setMaxCount] = usePersistentIntQuery('artist_max_count', 10)
  const [selected, setSelected] = useState<ArtistRanking>()

  const fetchData = useCallback(
    debounce(async (timeframe: string, maxCount: number, friendID?: string) => {
      if (error || !authState.access_token) return
      setLoading(true)
      const response = await GetArtistsByTimeframe(
        authState.access_token,
        timeframe,
        maxCount,
        friendID
      )
      setLoading(false)
      if ('error' in response) {
        displayError(response.error)
        setError(response.error)
        return
      }
      setArtistRankings(response)
      return
    }, 500),
    [error, authState]
  )

  const groupings = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return groupBy(artistRankings, (ranking) => {
          return ranking.startDate.add(-1, 'day').set('day', 1)
        })
      case 'week':
        return groupBy(artistRankings, (ranking) => {
          return ranking.startDate.set('date', 1).add(1, 'day')
        })
      default:
        return groupBy(artistRankings, (ranking) => {
          return ranking.startDate.year()
        })
    }
  }, [artistRankings, timeframe])

  useEffect(() => {
    fetchData(timeframe, maxCount, statsFriendState.friend?.id)
  }, [fetchData, maxCount, statsFriendState.friend?.id, timeframe])

  const displayRanking = useCallback(
    (ranking: ArtistRanking) => (
      <ArtistRibbon
        artist={ranking.artist}
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
    [setSelected]
  )

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
            <LoadingButton
              onClickAsync={() => fetchData(timeframe, maxCount, statsFriendState.friend?.id)}
            >
              Refresh
            </LoadingButton>
          </Stack>
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
                  timeframe={timeframe}
                />
              ) : (
                <div />
              )
            })}
        </Stack>
      </Stack>
      <StreamCountModal
        title={selected?.artist.name}
        trackURIs={selected?.tracks}
        onClose={() => setSelected(undefined)}
      />
    </div>
  )
}
