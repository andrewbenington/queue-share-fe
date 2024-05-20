import { Card, Grid, Stack, Typography } from '@mui/joy'
import dayjs from 'dayjs'
import useIsMobile from '../../hooks/is_mobile'
import { MonthlyTrackRanking } from '../../service/stats'
import { TrackRibbon } from '../track-ribbon'

type ArtistsTreeProps = {
  year: number
  data: MonthlyTrackRanking[]
}

export default function YearSongMonthlyRankings(props: ArtistsTreeProps) {
  const { year, data } = props
  const isMobile = useIsMobile()

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

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }} fontSize={24} fontWeight="bold">
        {year}
      </Typography>
      <Stack direction={isMobile ? 'column-reverse' : 'row'} style={{ overflowX: 'auto' }}>
        {data
          .filter((songRankings) => songRankings.tracks.length > 0)
          .map((songRankings) => (
            <Stack spacing={0} minWidth={isMobile ? undefined : 300}>
              <Typography fontSize={18} fontWeight="bold" style={{ marginBottom: 8 }}>
                {dayjs()
                  .month(songRankings.month - 1)
                  .format('MMMM')}
              </Typography>
              {songRankings.tracks.slice(0, 10).map((song, i) => (
                <Grid container key={song.spotify_id}>
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
                        color: rankChangeColor(song.rank_change),
                      }}
                    >
                      {formatRankChange(song.rank_change)}
                    </i>
                  </Grid>
                  <Grid xs={10} style={{ fontSize: 12 }}>
                    <TrackRibbon
                      song={song.track}
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
                          <b>{song.stream_count} streams</b>
                          {formatStreamsChange(song.streams_change)}
                        </div>
                      }
                      link
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
