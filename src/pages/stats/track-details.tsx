import { Card, CircularProgress, Grid, Stack, Typography } from '@mui/joy'
import dayjs from 'dayjs'
import { max, mean, min, range, sum } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import MonthlyRankingCal from '../../components/monthly-ranking-cal'
import YearGraph from '../../components/stats/year-graph'
import useIsMobile from '../../hooks/is_mobile'
import { MonthRanking } from '../../service/stats'
import { GetTrackRankings, GetTrackStats, TrackStats } from '../../service/stats/tracks'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/friend_stats'
import { displayError } from '../../util/errors'

type StreamsByYearAndDate = { [year: number]: { [date: string]: number } }

export default function TrackDetails() {
  const { spotify_uri } = useParams()
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [trackData, setTrackData] = useState<TrackStats>()
  const [rankings, setRankings] = useState<MonthRanking[]>()
  const [loading, setLoading] = useState(false)
  const [statsFriendState] = useContext(StatFriendContext)
  const isMobile = useIsMobile()

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    const response = await GetTrackStats(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id
    )
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setTrackData(response)
  }, [error, authState, spotify_uri, statsFriendState])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchData()
  }, [spotify_uri, authState, error, statsFriendState])

  const fetchRankings = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetTrackRankings(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id
    )
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setRankings(response)
  }, [error, authState, spotify_uri, statsFriendState])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchRankings()
  }, [spotify_uri, error, authState, statsFriendState])

  const minYear = useMemo(
    () => min(trackData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [trackData]
  ).year()

  const maxYear = useMemo(
    () => max(trackData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [trackData]
  ).year()

  const streamsByDate: StreamsByYearAndDate = useMemo(() => {
    const data: StreamsByYearAndDate = {}
    trackData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format('YYYY-MM-DD')
      const streamYear = stream.timestamp.year()
      if (!(streamYear in data)) {
        data[streamYear] = {}
      }
      if (dateString in data[streamYear]) {
        data[streamYear][dateString] += 1
      } else {
        data[streamYear][dateString] = 1
      }
    })
    return data
  }, [trackData])

  const maxCount = useMemo(
    () =>
      max(
        Object.values(streamsByDate).flatMap((yearStreams) =>
          Object.values(yearStreams).flatMap((itemCounts) => sum(Object.values(itemCounts)))
        )
      ),
    [streamsByDate]
  )

  const averageTimeOfDayHours = useMemo(
    () =>
      trackData
        ? mean(
            trackData.streams.map(
              (stream) => stream.timestamp.hour() + stream.timestamp.minute() / 60
            )
          )
        : 0,
    [trackData]
  )

  const firstStream = useMemo(() => {
    if (!trackData?.streams.length) return undefined
    return trackData.streams[0]
  }, [trackData])

  const latestStream = useMemo(() => {
    if (!trackData?.streams.length) return undefined
    return trackData.streams[trackData.streams.length - 1]
  }, [trackData])

  return (
    <div
      style={{
        flex: 1,
        width: 0,
        padding: 16,
        overflowY: 'auto',
        height: '100%',
      }}
    >
      {error ??
        (trackData ? (
          <Grid container columnSpacing={2} rowSpacing={2} style={{ overflowY: 'auto' }}>
            <Grid xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row">
                    <img
                      src={trackData.track.image_url}
                      height={isMobile ? 64 : 128}
                      width={isMobile ? 64 : 128}
                    />
                    <Stack spacing={0}>
                      <div style={{ fontSize: 28 }}>{trackData.track.name}</div>
                      <Link
                        to={`/stats/artist/${trackData.track.artist_uri}`}
                        style={{ fontSize: 18 }}
                      >
                        {trackData.track.artist_name}
                      </Link>
                      {trackData.track.other_artists?.map((artist) => (
                        <Link to={`/stats/artist/${artist.uri}`} style={{ fontSize: 18 }}>
                          {artist.name}
                        </Link>
                      ))}
                      <Link
                        to={`/stats/album/${trackData.track.album_uri}`}
                        style={{ fontSize: 16 }}
                      >
                        {trackData.track.album_name}
                      </Link>
                      <div style={{ fontSize: 16, marginTop: 8 }}>ISRC: {trackData.track.isrc}</div>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <Stack>
                    {trackData.streams.length ? (
                      <>
                        {firstStream && (
                          <div>First Stream: {firstStream.timestamp.format('MMM DD, YYYY')}</div>
                        )}
                        {latestStream && (
                          <div>Latest Stream: {latestStream.timestamp.format('MMM DD, YYYY')}</div>
                        )}
                        {firstStream && (
                          <div>
                            Average Time of Day:{' '}
                            {dayjs(
                              `00-01-01 ${averageTimeOfDayHours.toPrecision(2)}:${(
                                (averageTimeOfDayHours * 60) %
                                60
                              )
                                .toFixed(0)
                                .padStart(2, '0')}`
                            )
                              .utc(true)
                              .tz()
                              .format('h:mm a')}
                          </div>
                        )}
                      </>
                    ) : (
                      <div />
                    )}
                    <Typography>{trackData.streams.length} streams</Typography>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            {firstStream && (
              <Grid xs={12} md={6}>
                <MonthlyRankingCal
                  rankings={rankings}
                  loading={loading}
                  firstStream={trackData.streams[0].timestamp}
                  lastStream={trackData.streams[trackData.streams.length - 1].timestamp}
                />
              </Grid>
            )}
            <Grid xs={12}>
              <Card>
                <Typography>All Streams</Typography>
                <div
                  style={{
                    overflowY: 'auto',
                    height: '100%',
                    overflowX: 'hidden',
                  }}
                >
                  {range(maxYear, minYear - 1, -1).map((year) => {
                    const yearData = Object.entries(streamsByDate[year] ?? {}).map(
                      ([date, count]) => ({ date: dayjs(date), count })
                    )
                    return yearData.length ? (
                      <YearGraph key={year} year={year} data={yearData} maxCount={maxCount ?? 10} />
                    ) : (
                      <div />
                    )
                  })}
                </div>
              </Card>
            </Grid>
          </Grid>
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <CircularProgress />
          </div>
        ))}
    </div>
  )
}
