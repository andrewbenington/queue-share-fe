import { Card, Grid, Stack, Typography } from '@mui/joy'
import { Dayjs } from 'dayjs'
import { useMemo } from 'react'
import useIsMobile from '../../hooks/is_mobile'
import { MonthlyArtistRanking } from '../../service/stats/artists'
import { ArtistRibbon } from '../artist-ribbon'

type ArtistsRankingsProps = {
  data: MonthlyArtistRanking[]
  start: Dayjs
  timeframe: string
}

function formatStreamsChange(change?: number): string {
  if (change === undefined) return ''
  if (change > 0) return ` (+${change})`
  if (change === 0) return ` (±${change})`
  return ` (${change})`
}

function formatRankChange(change?: number): string {
  if (change === undefined) return '(new)'
  if (change > 0) return `+${change} ↗`
  if (change === 0) return `±0`
  return `${change} ↘`
}

function rankChangeColor(change?: number): string | undefined {
  if (change === undefined) return '#ffcc00'
  if (change > 0) return '#00ff00'
  if (change === 0) return undefined
  return '#ff0000'
}

function trackDisplay(tracks: string[]) {
  const counts: { [track: string]: number } = {}
  tracks.forEach((track) => {
    if (track in counts) {
      counts[track]++
    } else {
      counts[track] = 1
    }
  })
  return Object.entries(counts)
    .sort(([, countA], [, countB]) => countB - countA)
    .map(([track, count]) => `${track} (${count})`)
    .slice(0, 10)
    .join('\n')
}

export default function ArtistRankingRow(props: ArtistsRankingsProps) {
  const { start, data, timeframe } = props
  const isMobile = useIsMobile()

  const title = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return start.format('MMM D') + ' - ' + start.add(6, 'day').format('MMM D, YYYY')
      case 'week':
        return start.format('MMMM YYYY')
      default:
        return start.year()
    }
  }, [start])

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }} fontSize={24} fontWeight="bold">
        {title}
      </Typography>
      <Stack direction={isMobile ? 'column-reverse' : 'row'} style={{ overflowX: 'auto' }}>
        {data
          .filter((artistRankings) => artistRankings.artists.length > 0)
          .map((artistRankings) => (
            <Stack
              spacing={0}
              minWidth={isMobile ? undefined : 300}
              maxWidth={isMobile ? undefined : 300}
            >
              <Typography fontSize={18} fontWeight="bold" style={{ marginBottom: 8 }}>
                {artistRankings.timeframe === 'year'
                  ? ''
                  : artistRankings.timeframe === 'month'
                    ? artistRankings.startDate.month(artistRankings.month - 1).format('MMMM')
                    : artistRankings.timeframe === 'week'
                      ? artistRankings.startDate.format('MMM D') +
                        ' - ' +
                        artistRankings.startDate.add(6, 'day').format('MMM D')
                      : artistRankings.startDate.format('ddd, MMM D')}
                {/* <div>{artistRankings.startDate.toISOString()}</div> */}
              </Typography>
              {artistRankings.artists.map((artist, i) => (
                <Grid container key={artist.spotify_id}>
                  <Grid xs={2}>
                    <div
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {i + 1}.
                    </div>
                    <i
                      style={{
                        color: rankChangeColor(artist.rank_change),
                      }}
                    >
                      {formatRankChange(artist.rank_change)}
                    </i>
                  </Grid>
                  <Grid xs={10} style={{ fontSize: 12 }}>
                    <ArtistRibbon
                      artist={artist.artist}
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
                          <b title={trackDisplay(artist.tracks)}>{artist.stream_count} streams</b>
                          {formatStreamsChange(artist.streams_change)}
                        </div>
                      }
                    />
                  </Grid>
                </Grid>
              ))}
            </Stack>
          ))}
      </Stack>
    </Card>
  )
}
