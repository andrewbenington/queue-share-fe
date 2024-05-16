import { Chip, ListItem, Paper } from '@mui/material'
import Stack from '@mui/material/Stack/Stack'
import dayjs from 'dayjs'
import { max, min, range } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import LoadingContainer from '../../components/loading-container'
import YearSongMonthlyRankings from '../../components/stats/songs-by-month'
import { GetTracksByMonth, MonthlyTrackRanking } from '../../service/stats'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import { useStringListQuery } from '../../hooks/useQueryParam'
import { Person } from '@mui/icons-material'

export default function SongRankingsPage() {
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [songsByMonth, setSongsByMonth] = useState<MonthlyTrackRanking[]>()
  const minYear = useMemo(
    () => min(songsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [songsByMonth]
  )
  const maxYear = useMemo(
    () => max(songsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [songsByMonth]
  )
  const [searchParams] = useSearchParams()
  const [artistURIs, setArtistURIs] = useStringListQuery('artist_uris')

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return
    setLoading(true)
    const response = await GetTracksByMonth(
      authState.access_token,
      30,
      true,
      artistURIs ? artistURIs[0] : undefined,
      searchParams.get('album_uri') ?? undefined
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setSongsByMonth(response)
    return
  }, [loading, error, authState, searchParams])

  useEffect(() => {
    if (loading || error || !authState.access_token) return
    fetchData()
  }, [authState, error, artistURIs])

  return (
    <div style={{ overflowY: 'scroll', width: '100%', padding: 16 }}>
      <Stack>
        <Paper
          sx={{
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            listStyle: 'none',
            p: 0.5,
            m: 0,
          }}
          component="ul"
        >
          <div>Artist Filter:</div>
          {artistURIs?.map((artistURI) => {
            return (
              <ListItem key={artistURI}>
                <Chip
                  icon={<Person />}
                  label={artistURI}
                  onDelete={() => setArtistURIs(artistURIs?.filter((uri) => uri !== artistURI))}
                />
              </ListItem>
            )
          }) ?? <div>None</div>}
        </Paper>
        <LoadingContainer loading={loading}>
          <Stack>
            {range(maxYear, minYear - 1, -1).map((year) => {
              const data = songsByMonth?.filter((data) => data.year === year)
              return data?.length ? (
                <YearSongMonthlyRankings key={year} year={year} data={data} />
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
