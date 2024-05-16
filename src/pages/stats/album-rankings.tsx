import { Card, Checkbox, TextField } from '@mui/material'
import Stack from '@mui/material/Stack/Stack'
import dayjs from 'dayjs'
import { max, min, range } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LoadingButton from '../../components/loading-button'
import LoadingContainer from '../../components/loading-container'
import YearAlbumRankings from '../../components/stats/albums-by-month'
import { GetAlbumsByMonth, MonthlyAlbumRanking } from '../../service/stats/albums'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'

export default function AlbumRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [albumsByMonth, setAlbumsByMonth] = useState<MonthlyAlbumRanking[]>()
  const minYear = useMemo(
    () => min(albumsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [albumsByMonth]
  )
  const maxYear = useMemo(
    () => max(albumsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [albumsByMonth]
  )
  const [minStreamTime, setMinStreamTime] = useState<number>(30)
  const [excludeSkips, setExcludeSkips] = useState(true)
  const [searchParams] = useSearchParams()

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetAlbumsByMonth(
      authState.access_token,
      minStreamTime,
      excludeSkips,
      searchParams.get('artist_uri') ?? undefined
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setAlbumsByMonth(response)
    return
  }, [loading, error, authState, minStreamTime, excludeSkips])

  useEffect(() => {
    if (loading || error || !authState.access_token || albumsByMonth) return
    fetchData()
  }, [authState, error, albumsByMonth, minStreamTime, excludeSkips])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <Stack>
        <Card>
          <Stack direction="row">
            <TextField
              label={'Minimum Stream Time (seconds)'}
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
        <LoadingContainer loading={loading && !albumsByMonth}>
          <Stack>
            {range(maxYear, minYear - 1, -1).map((year) => {
              const data = albumsByMonth?.filter((data) => data.year === year)
              return data?.length ? (
                <YearAlbumRankings key={year} year={year} data={data} />
              ) : (
                <div />
              )
            })}
          </Stack>
        </LoadingContainer>
      </Stack>
    </div>
  )
}
