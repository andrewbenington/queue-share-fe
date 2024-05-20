import { Card, Checkbox, Input, Stack } from '@mui/joy'
import dayjs from 'dayjs'
import { max, min, range } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import CollapsingProgress from '../../components/collapsing-progress'
import LoadingButton from '../../components/loading-button'
import YearArtistRankings from '../../components/stats/artists-by-month'
import { GetArtistsByMonth, MonthlyArtistRanking } from '../../service/stats/artists'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { displayError } from '../../util/errors'

export default function ArtistRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [artistsByMonth, setArtistsByMonth] = useState<MonthlyArtistRanking[]>()
  const [statsFriendState] = useContext(StatFriendContext)
  const minYear = useMemo(
    () => min(artistsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [artistsByMonth]
  )
  const maxYear = useMemo(
    () => max(artistsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [artistsByMonth]
  )
  const [minStreamTime, setMinStreamTime] = useState<number>(30)
  const [excludeSkips, setExcludeSkips] = useState(true)

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetArtistsByMonth(
      authState.access_token,
      minStreamTime,
      excludeSkips,
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
  }, [loading, error, authState, minStreamTime, excludeSkips, statsFriendState])

  useEffect(() => {
    if (loading || error || !authState.access_token || artistsByMonth) return
    fetchData()
  }, [authState, error, artistsByMonth, minStreamTime, excludeSkips])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, minStreamTime, excludeSkips, statsFriendState])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <CollapsingProgress loading={loading} />
      <Stack>
        <Card variant="soft">
          <Stack direction="row">
            <Input
              placeholder={'Minimum Stream Time (seconds)'}
              type="number"
              value={minStreamTime}
              onChange={(e) => setMinStreamTime(parseFloat(e.target.value))}
            />
            <label>
              Exclude Skips
              <Checkbox
                checked={excludeSkips}
                onChange={(e) => setExcludeSkips(e.target.checked)}
              />
            </label>
            <LoadingButton onClickAsync={fetchData}>Reload</LoadingButton>
          </Stack>
        </Card>
        <Stack>
          {range(maxYear, minYear - 1, -1).map((year) => {
            const data = artistsByMonth?.filter((data) => data.year === year)
            return data?.length ? (
              <YearArtistRankings key={year} year={year} data={data} />
            ) : (
              <div />
            )
          })}
        </Stack>
      </Stack>
    </div>
  )
}
