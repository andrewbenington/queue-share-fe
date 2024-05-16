import { Card, CircularProgress, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import { max, mean, min, range, sum } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import YearGraph, { ItemCounts } from '../../components/stats/year-graph'
import { MonthRanking } from '../../service/stats'
import { AuthContext } from '../../state/auth'
import { displayError } from '../../util/errors'
import { MinEntry } from '../../types/stats'
import { Person } from '@mui/icons-material'
import useIsMobile from '../../hooks/is_mobile'
import MonthlyRankingCal from '../../components/monthly-ranking-cal'
import { ArtistStats, GetArtistStats, GetArtistRankings } from '../../service/stats/artists'

type StreamsByYearAndDate = { [year: number]: { [date: string]: ItemCounts } }

export default function ArtistDetails() {
  const { spotify_uri } = useParams()
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [artistData, setArtistData] = useState<ArtistStats>()
  const [rankings, setRankings] = useState<MonthRanking[]>()
  const [loading, setLoading] = useState(false)
  const isMobile = useIsMobile()

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    const response = await GetArtistStats(authState.access_token, spotify_uri)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setArtistData(response)
  }, [error, authState, spotify_uri])

  useEffect(() => {
    if (error || !authState.access_token || artistData) return
    fetchData()
  }, [authState, error, artistData])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchData()
  }, [spotify_uri, error, authState])

  const fetchRankings = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return
    setLoading(true)
    const response = await GetArtistRankings(authState.access_token, spotify_uri)
    setLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setRankings(response)
  }, [error, authState, spotify_uri])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchRankings()
  }, [spotify_uri, error, authState])

  const minYear = useMemo(
    () => min(artistData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [artistData]
  ).year()

  const maxYear = useMemo(
    () => max(artistData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [artistData]
  ).year()

  const streamsByDate: StreamsByYearAndDate = useMemo(() => {
    const data: StreamsByYearAndDate = {}
    artistData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format('YYYY-MM-DD')
      const streamYear = stream.timestamp.year()
      if (!(streamYear in data)) {
        data[streamYear] = {}
      }
      if (dateString in data[streamYear]) {
        if (stream.track_name in data[streamYear][dateString]) {
          data[streamYear][dateString][stream.track_name] += 1
        } else {
          data[streamYear][dateString][stream.track_name] = 1
        }
      } else {
        data[streamYear][dateString] = {
          [stream.track_name]: 1,
        }
      }
    })
    return data
  }, [artistData])

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
      artistData
        ? mean(
            artistData.streams.map(
              (stream) => stream.timestamp.hour() + stream.timestamp.minute() / 60
            )
          )
        : 0,
    [artistData]
  )

  const topTracks = useMemo(() => {
    const streamsByURI: { [key: string]: MinEntry } = {}
    const trackCountByURI: { [key: string]: number } = {}
    artistData?.streams.forEach((stream) => {
      streamsByURI[stream.spotify_track_uri] = stream
      if (!(stream.spotify_track_uri in trackCountByURI)) {
        trackCountByURI[stream.spotify_track_uri] = 1
      } else {
        trackCountByURI[stream.spotify_track_uri] += 1
      }
    })
    return Object.entries(trackCountByURI)
      .map(([uri, count]) => ({
        ...streamsByURI[uri],
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 30)
  }, [artistData])

  const topAlbums = useMemo(() => {
    const streamsByURI: { [key: string]: MinEntry } = {}
    const albumCountByURI: { [key: string]: number } = {}
    artistData?.streams.forEach((stream) => {
      streamsByURI[stream.spotify_album_uri] = stream
      if (!(stream.spotify_album_uri in albumCountByURI)) {
        albumCountByURI[stream.spotify_album_uri] = 1
      } else {
        albumCountByURI[stream.spotify_album_uri] += 1
      }
    })
    return Object.entries(albumCountByURI)
      .map(([uri, count]) => ({
        ...streamsByURI[uri],
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }, [artistData])

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
        (artistData ? (
          <Grid container columnSpacing={2} rowSpacing={2} style={{ overflowY: 'auto' }}>
            <Grid item xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row">
                    {artistData.artist.images.length ? (
                      <img src={artistData.artist.images[0].url} height={128} width={128} />
                    ) : (
                      <div
                        style={{
                          height: 128,
                          width: 128,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: '#ccc9',
                        }}
                      >
                        <Person style={{ fontSize: 96 }} />
                      </div>
                    )}
                    <Stack spacing={1}>
                      <div style={{ fontSize: 24 }}>{artistData.artist.name}</div>
                      {spotify_uri}
                      <div style={{ fontSize: 18 }}>Popularity: {artistData.artist.popularity}</div>
                      <Typography variant="body1">{artistData.streams.length} streams</Typography>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <Stack>
                    {artistData.streams.length ? (
                      <>
                        <div>
                          First Stream: {artistData.streams[0].track_name} (
                          {artistData.streams[0].timestamp.format('MMM DD, YYYY')})
                        </div>
                        <div>
                          Latest Stream:{' '}
                          {artistData.streams[artistData.streams.length - 1].track_name} (
                          {artistData.streams[artistData.streams.length - 1].timestamp.format(
                            'MMM DD, YYYY'
                          )}
                          )
                        </div>
                        <div>
                          Average Time of Day:{' '}
                          {dayjs(
                            `00-01-01 ${averageTimeOfDayHours.toPrecision(2)}:${(
                              (averageTimeOfDayHours * 60) %
                              60
                            )
                              .toFixed(0)
                              .padStart(2, '0')}`
                          ).format('h:mm a')}
                        </div>
                      </>
                    ) : (
                      <div />
                    )}
                    <Typography variant="body1">{artistData.streams.length} streams</Typography>
                  </Stack>
                </Card>
                <MonthlyRankingCal
                  rankings={rankings}
                  loading={loading}
                  firstStream={artistData.streams[0].timestamp}
                  lastStream={artistData.streams[artistData.streams.length - 1].timestamp}
                />
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                    <Typography>Top Tracks</Typography>
                    <Link to={`/stats/songs-by-month?artist_uris=${artistData.artist.uri}`}>
                      <button style={{ marginTop: -6 }}>View By Month</button>
                    </Link>
                  </Stack>
                  <Stack>
                    <Grid container>
                      {topTracks.map((trackData, i) => (
                        <>
                          <Grid item xs={9} key={`number_${i}`}>
                            {i + 1}.{' '}
                            <Link
                              to={`/stats/track/${trackData.spotify_track_uri}`}
                              style={{
                                textDecoration: isMobile ? 'underline' : undefined,
                              }}
                            >
                              {trackData.track_name}
                            </Link>
                          </Grid>
                          <Grid item xs={3} key={`streams_${i}`}>
                            {trackData.count} streams
                          </Grid>
                        </>
                      ))}
                    </Grid>
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                  <Typography>Top Albums</Typography>
                  <Link to={`/stats/albums-by-month?artist_uri=${artistData.artist.uri}`}>
                    <button style={{ marginTop: -6 }}>View By Month</button>
                  </Link>
                </Stack>
                <Stack>
                  <Grid container>
                    {topAlbums.map((albumData, i) => (
                      <>
                        <Grid item xs={9} key={`name_${i}`}>
                          <Link
                            to={`/stats/album/${albumData.spotify_album_uri}`}
                            style={{
                              textDecoration: isMobile ? 'underline' : undefined,
                            }}
                          >
                            {i + 1}. {albumData.album_name}
                          </Link>
                        </Grid>
                        <Grid item xs={3} key={`streams_${i}`}>
                          {albumData.count} streams
                        </Grid>
                      </>
                    ))}
                  </Grid>
                </Stack>
              </Card>
            </Grid>
            <Grid item xs={12}>
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
                      ([date, itemCounts]) => ({
                        date: dayjs(date),
                        itemCounts,
                      })
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
