import { Card, Input, Option, Select, Stack } from '@mui/joy'
import dayjs from 'dayjs'
import { groupBy } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import CollapsingProgress from '../../components/collapsing-progress'
import LoadingButton from '../../components/loading-button'
import ArtistRankingRow from '../../components/stats/artists-by-month'
import { GetArtistsByTimeframe, MonthlyArtistRanking } from '../../service/stats/artists'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { displayError } from '../../util/errors'

export default function ArtistRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [artistsByMonth, setArtistsByMonth] = useState<MonthlyArtistRanking[]>()
  const [statsFriendState] = useContext(StatFriendContext)
  const [timeframe, setTimeframe] = useState('month')
  const [maxCount, setMaxCount] = useState(10)

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetArtistsByTimeframe(
      authState.access_token,
      timeframe,
      maxCount,
      statsFriendState.friend?.id
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setArtistsByMonth(response)
    return
  }, [loading, error, authState, statsFriendState, maxCount, timeframe])

  useEffect(() => {
    if (loading || error || !authState.access_token || artistsByMonth) return
    fetchData()
  }, [authState, error, artistsByMonth])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, statsFriendState])

  const groupings = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return groupBy(artistsByMonth, (ranking) => {
          return ranking.startDate.add(-1, 'day').set('day', 0).add(1, 'day')
        })
      case 'week':
        return groupBy(artistsByMonth, (ranking) => {
          return ranking.startDate.set('date', 1)
        })
      default:
        return groupBy(artistsByMonth, (ranking) => {
          return ranking.startDate.year()
        })
    }
  }, [artistsByMonth])

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
            </Select>
            <Input
              value={maxCount}
              type="number"
              onChange={(e) => setMaxCount(parseInt(e.target.value))}
            />
            <LoadingButton onClickAsync={fetchData}>Refresh</LoadingButton>
          </Stack>
        </Card>
        <Stack>
          {Object.entries(groupings)
            .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
            .map(([start, ranks]) => {
              return ranks?.length ? (
                <ArtistRankingRow
                  key={start}
                  start={dayjs(start)}
                  data={ranks}
                  timeframe={timeframe}
                />
              ) : (
                <div />
              )
            })}
        </Stack>
      </Stack>
    </div>
  )
}
