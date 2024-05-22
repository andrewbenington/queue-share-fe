import { Stack } from '@mui/joy'
import dayjs from 'dayjs'
import { max, min, range } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CollapsingProgress from '../../components/collapsing-progress'
import YearAlbumRankings from '../../components/stats/albums-by-month'
import { GetAlbumsByMonth, MonthlyAlbumRanking } from '../../service/stats/albums'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { displayError } from '../../util/errors'

export default function AlbumRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [albumsByMonth, setAlbumsByMonth] = useState<MonthlyAlbumRanking[]>()
  const [statsFriendState] = useContext(StatFriendContext)

  const minYear = useMemo(
    () => min(albumsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [albumsByMonth]
  )
  const maxYear = useMemo(
    () => max(albumsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [albumsByMonth]
  )
  const [searchParams] = useSearchParams()

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetAlbumsByMonth(
      authState.access_token,
      30,
      true,
      searchParams.get('artist_uri') ?? undefined,
      statsFriendState.friend?.id
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setAlbumsByMonth(response)
    return
  }, [loading, error, authState, statsFriendState.friend?.id])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, statsFriendState])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 8 }}>
      <CollapsingProgress loading={loading} />
      <Stack>
        <Stack spacing={1}>
          {range(maxYear, minYear - 1, -1).map((year) => {
            const data = albumsByMonth?.filter((data) => data.year === year)
            return data?.length ? (
              <YearAlbumRankings key={year} year={year} data={data} />
            ) : (
              <div key={year} />
            )
          })}
        </Stack>
      </Stack>
    </div>
  )
}
