import { Card, Grid, Stack, Typography } from '@mui/material'
import dayjs from 'dayjs'
import useIsMobile from '../../hooks/is_mobile'
import { MonthlyAlbumRanking } from '../../service/stats/albums'
import { AlbumRibbon } from '../album-ribbon'

type YearAlbumRankingsProps = {
  year: number
  data: MonthlyAlbumRanking[]
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

export default function YearAlbumRankings(props: YearAlbumRankingsProps) {
  const { year, data } = props
  const isMobile = useIsMobile()

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }}>{year}</Typography>
      <Stack direction={isMobile ? 'column-reverse' : 'row'} style={{ overflowX: 'auto' }}>
        {data
          .filter((albumRankings) => albumRankings.albums.length > 0)
          .map((albumRankings) => (
            <Stack spacing={0} key={`${albumRankings.year}-${albumRankings.month}`}>
              <Typography variant="h6" style={{ marginBottom: 8 }}>
                {dayjs()
                  .month(albumRankings.month - 1)
                  .format('MMMM')}
              </Typography>
              {albumRankings.albums.slice(0, 10).map((album, i) => (
                <Grid container key={album.spotify_id}>
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
                        color: rankChangeColor(album.rank_change),
                      }}
                    >
                      {formatRankChange(album.rank_change)}
                    </i>
                  </Grid>
                  <Grid item xs={10} style={{ width: 300, fontSize: 12 }}>
                    <AlbumRibbon
                      album={album.album}
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
                          <b title={trackDisplay(album.tracks)}>x{album.stream_count} streams</b>
                          {formatStreamsChange(album.streams_change)}
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
