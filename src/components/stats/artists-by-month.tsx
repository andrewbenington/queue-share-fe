import { Card, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import useIsMobile from '../../hooks/is_mobile'
import { ArtistRibbon } from '../artist-ribbon'
import { MonthlyArtistRanking } from '../../service/stats/artists'

type ArtistsTreeProps = {
  year: number
  data: MonthlyArtistRanking[]
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

export default function YearArtistRankings(props: ArtistsTreeProps) {
  const { year, data } = props
  const isMobile = useIsMobile()

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }}>{year}</Typography>
      <Stack direction={isMobile ? 'column-reverse' : 'row'} style={{ overflowX: 'auto' }}>
        {data
          .filter((artistRankings) => artistRankings.artists.length > 0)
          .map((artistRankings) => (
            <Stack spacing={0}>
              <Typography variant="h6" style={{ marginBottom: 8 }}>
                {dayjs()
                  .month(artistRankings.month - 1)
                  .format('MMMM')}
              </Typography>
              {artistRankings.artists.slice(0, 10).map((artist, i) => (
                <Grid container key={artist.spotify_id}>
                  <Grid item xs={2}>
                    <div
                      style={{
                        fontWeight: 'bold',
                      }}
                    >
                      {i + 1}.
                    </div>
                    <i
                      style={{
                        opacity: 0.5,
                        color: rankChangeColor(artist.rank_change),
                      }}
                    >
                      {formatRankChange(artist.rank_change)}
                    </i>
                  </Grid>
                  <Grid item xs={10} style={{ width: 300, fontSize: 12 }}>
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
