import { Button, Card, Grid, Stack, Typography } from '@mui/joy'
import dayjs from 'dayjs'
import { max, mean, min, range, sum } from 'lodash'
import { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import CollapsingProgress from '../../components/display/collapsing-progress'
import MonthlyRankingCal from '../../components/monthly-ranking-cal'
import YearGraph, { ComponentsWithCount } from '../../components/stats/year-graph'
import { TrackRibbonNarrow } from '../../components/track-ribbon-narrow'
import StreamWithCaption from '../../components/track-with-caption'
import useIsMobile from '../../hooks/is_mobile'
import { MonthRanking } from '../../service/stats'
import { AlbumStats, GetAlbumRankings, GetAlbumStats } from '../../service/stats/albums'
import { AuthContext } from '../../state/auth'
import { StatFriendContext } from '../../state/stat_friend'
import { MinEntry } from '../../types/stats'
import { displayError } from '../../util/errors'
import { spotifyIDFromURI } from '../../util/spotify'

type RibbonsByYearAndDate = { [year: number]: { [date: string]: ComponentsWithCount } }

export default function AlbumDetails() {
  const { spotify_uri } = useParams()
  const [authState] = useContext(AuthContext)
  const [error, setError] = useState<string>()
  const [albumData, setAlbumData] = useState<AlbumStats>()
  const [rankings, setRankings] = useState<MonthRanking[]>()
  const [loading, setLoading] = useState(false)
  const [rankLoading, setRankLoading] = useState(false)
  const [statsFriendState] = useContext(StatFriendContext)
  const isMobile = useIsMobile()

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri || loading) return
    setLoading(true)
    const response = await GetAlbumStats(
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
    setAlbumData(response)
  }, [error, authState, spotify_uri, statsFriendState, loading])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchData()
  }, [spotify_uri, error, authState, statsFriendState])

  const fetchRankings = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri || rankLoading) return
    setRankLoading(true)
    const response = await GetAlbumRankings(
      authState.access_token,
      spotify_uri,
      statsFriendState.friend?.id
    )
    setRankLoading(false)
    if ('error' in response) {
      displayError(response.error)
      setError(response.error)
      return
    }
    setRankings(response)
  }, [error, authState, spotify_uri, statsFriendState, rankLoading])

  useEffect(() => {
    if (error || !authState.access_token) return
    fetchRankings()
  }, [spotify_uri, error, authState, statsFriendState])

  const minYear = useMemo(
    () => min(albumData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [albumData]
  ).year()

  const maxYear = useMemo(
    () => max(albumData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [albumData]
  ).year()

  const streamsByDate: RibbonsByYearAndDate = useMemo(() => {
    const data: RibbonsByYearAndDate = {}
    albumData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format('YYYY-MM-DD')
      const streamYear = stream.timestamp.year()
      if (!(streamYear in data)) {
        data[streamYear] = {}
      }

      const track = albumData.tracks[spotifyIDFromURI(stream.spotify_track_uri)]
      let count = 1

      if (!(dateString in data[streamYear])) {
        data[streamYear][dateString] = {}
      } else if (stream.spotify_track_uri in data[streamYear][dateString]) {
        count = data[streamYear][dateString][stream.spotify_track_uri].count + 1
      }

      data[streamYear][dateString][stream.spotify_track_uri] = {
        count,
        component: (
          <TrackRibbonNarrow
            track={track}
            rightComponent={<div>x{count}</div>}
            cardVariant="plain"
          />
        ),
      }
    })
    return data
  }, [albumData])

  const maxCount = useMemo(
    () =>
      max(
        Object.values(streamsByDate).flatMap((yearStreams) =>
          Object.values(yearStreams).flatMap((componentsWithCounts) =>
            sum(Object.values(componentsWithCounts).map((data) => data.count))
          )
        )
      ),
    [streamsByDate]
  )

  const averageTimeOfDayHours = useMemo(
    () =>
      albumData
        ? mean(
            albumData.streams.map(
              (stream) => stream.timestamp.hour() + stream.timestamp.minute() / 60
            )
          )
        : 0,
    [albumData]
  )

  const topTracks = useMemo(() => {
    const streamsByURI: { [key: string]: MinEntry } = {}
    const trackCountByURI: { [key: string]: number } = {}
    albumData?.streams.forEach((stream) => {
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
  }, [albumData])

  const firstStream = useMemo(() => {
    if (!albumData?.streams.length) return undefined
    return albumData.streams[0]
  }, [albumData])

  const latestStream = useMemo(() => {
    if (!albumData?.streams.length) return undefined
    return albumData.streams[albumData.streams.length - 1]
  }, [albumData])

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
      <CollapsingProgress loading={loading} />
      {error ??
        (albumData && (
          <Grid container columnSpacing={2} rowSpacing={2} style={{ overflowY: 'auto' }}>
            <Grid xs={12} md={6}>
              <Stack>
                <Card>
                  <Stack direction="row">
                    <img
                      src={albumData.album.image_url}
                      height={isMobile ? 64 : 128}
                      width={isMobile ? 64 : 128}
                    />
                    <Stack spacing={0}>
                      <div style={{ fontSize: 28 }}>{albumData.album.name}</div>
                      <Link
                        to={`/stats/artist/${albumData.album.artist_uri}`}
                        style={{ fontSize: 18 }}
                      >
                        {albumData.album.artist_name}
                      </Link>
                      <div style={{ fontSize: 16, marginTop: 8 }}>
                        {albumData.streams.length} streams
                      </div>
                    </Stack>
                  </Stack>
                </Card>
                <Card>
                  <Stack>
                    {firstStream && (
                      <StreamWithCaption
                        stream={firstStream}
                        track={albumData.tracks[spotifyIDFromURI(firstStream.spotify_track_uri)]}
                        caption="First Stream"
                      />
                    )}
                    {latestStream && (
                      <StreamWithCaption
                        stream={latestStream}
                        track={albumData.tracks[spotifyIDFromURI(latestStream.spotify_track_uri)]}
                        caption="Latest Stream"
                      />
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
                  </Stack>
                </Card>
                <Card>
                  <Stack direction="row" style={{ marginBottom: 8 }} justifyContent="space-between">
                    <Typography>Top Tracks</Typography>
                    <Link to={`/stats/track-rankings?album_uris=${albumData.album.uri}`}>
                      <Button style={{ marginTop: -6 }} variant="outlined">
                        View By Month
                      </Button>
                    </Link>
                  </Stack>
                  <Stack spacing={1}>
                    {topTracks.map((trackData, i) => (
                      <Stack direction="row" width="100%" alignItems="center">
                        <div style={{ width: 30, textAlign: 'right' }}>{i + 1}. </div>
                        <TrackRibbonNarrow
                          track={albumData.tracks[spotifyIDFromURI(trackData.spotify_track_uri)]}
                          rightComponent={<div>x{trackData.count}</div>}
                          cardVariant="outlined"
                          style={{ width: '100%' }}
                        />
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              </Stack>
            </Grid>
            {albumData.streams.length > 0 && (
              <Grid xs={12} md={6}>
                <MonthlyRankingCal
                  rankings={rankings?.map((ranking) => ({
                    ...ranking,
                    month: ranking.timestamp.month(),
                    year: ranking.timestamp.year(),
                  }))}
                  loading={loading}
                  firstStream={albumData.streams[0].timestamp}
                  lastStream={albumData.streams[albumData.streams.length - 1].timestamp}
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
                      ([date, componentsWithCount]) => ({
                        date: dayjs(date),
                        componentsWithCount,
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
        ))}
    </div>
  )
}
