import { Card, Grid, Stack, Typography } from '@mui/joy'
import { Dayjs } from 'dayjs'
import { useMemo } from 'react'
import useIsMobile from '../../hooks/is_mobile'
import { formatRankChange, rankChangeColor } from '../../util/format'

export type Ranking = {
  spotify_id: string
  stream_count: number
  streams_change?: number
  rank: number
  rank_change?: number
}

export type Rankings<T extends Ranking> = {
  rankings: T[]
  timeframe: string
  startDate: Dayjs
}

type RankingGroupProps<T extends Ranking> = {
  data: Rankings<T>[]
  displayRanking: (ranking: T) => JSX.Element
  start: Dayjs
  timeframe: string
}

export default function RankingRow<T extends Ranking>(props: RankingGroupProps<T>) {
  const { start, data: rankingData, displayRanking, timeframe } = props
  const isMobile = useIsMobile()

  const title = useMemo(() => {
    switch (timeframe) {
      case 'day':
        return start.format('MMM D') + ' - ' + start.add(6, 'day').format('MMM D, YYYY')
      case 'week':
        return start.format('MMMM YYYY')
      case 'all_time':
        return 'All Time'
      default:
        return start.year()
    }
  }, [start])

  const rankingStacks = useMemo(
    () =>
      rankingData
        .filter((data) => data.rankings.length > 0)
        .reverse()
        .map((data) => (
          <RankingStack
            data={data}
            displayRanking={displayRanking}
            key={data.startDate.toString()}
          />
        )),
    [rankingData]
  )
  return (
    <Card>
      <Typography
        style={{ marginBottom: 8 }}
        fontSize={24}
        fontWeight="bold"
        title={timeframe + ' - ' + start.toISOString()}
      >
        {title}
      </Typography>
      <Stack direction={isMobile ? 'column' : 'row'} style={{ overflowX: 'auto' }}>
        {rankingStacks}
      </Stack>
    </Card>
  )
}

function RankingStack<T extends Ranking>(props: {
  data: Rankings<T>
  displayRanking: (ranking: T) => JSX.Element
}) {
  const isMobile = useIsMobile()
  const { data, displayRanking } = props

  return (
    <Stack
      spacing={0}
      minWidth={isMobile ? undefined : 300}
      maxWidth={isMobile ? undefined : 300}
      key={data.startDate.toString()}
    >
      <Typography
        fontSize={18}
        fontWeight="bold"
        style={{ marginBottom: 8 }}
        title={data.startDate.toISOString()}
      >
        {data.timeframe === 'all_time'
          ? ''
          : data.timeframe === 'year'
            ? ''
            : data.timeframe === 'month'
              ? data.startDate.format('MMMM')
              : data.timeframe === 'week'
                ? data.startDate.format('MMM D') +
                  ' - ' +
                  data.startDate.add(6, 'day').format('MMM D')
                : data.startDate.format('ddd, MMM D')}
      </Typography>
      {data.rankings.map((ranking) => (
        <Grid container key={ranking.spotify_id}>
          <Grid xs={2}>
            <div
              style={{
                fontWeight: 'bold',
              }}
            >
              {ranking.rank}.
            </div>
            <i
              style={{
                color: rankChangeColor(ranking.rank_change),
              }}
            >
              {formatRankChange(ranking.rank_change)}
            </i>
          </Grid>
          <Grid xs={10} style={{ fontSize: 12 }}>
            {displayRanking(ranking)}
          </Grid>
        </Grid>
      ))}
    </Stack>
  )
}
