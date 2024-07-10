import { Card, Grid, Stack, Typography } from '@mui/joy'
import dayjs, { Dayjs } from 'dayjs'
import { round } from 'lodash'
import { useMemo } from 'react'
import useIsMobile from '../hooks/is_mobile'
import { MonthRanking } from '../service/stats'
import LoadingContainer from './loading-container'

type MonthlyRankingCalProps = {
  rankings?: MonthRanking[]
  loading?: boolean
  firstStream: Dayjs
  lastStream: Dayjs
}

const EXPONENT = 2

function weightInput(input: number) {
  return input ** EXPONENT
}

function formatColorNum(input: number) {
  return input.toString(16).padStart(2, '0')
}

function getRankingColor(ranking: number) {
  const weighted = round(weightInput((30 - ranking) / 30) * 100 + 150)

  return ranking ? `#${formatColorNum(weighted)}00${formatColorNum(weighted)}` : '#666'
}
export default function MonthlyRankingCal(props: MonthlyRankingCalProps) {
  const { rankings, loading, firstStream, lastStream } = props
  const isMobile = useIsMobile()

  const minDate = useMemo(() => firstStream.set('date', 1).set('month', 0), [rankings])

  const maxDate = useMemo(() => dayjs(new Date(lastStream.year() + 1, 0, 1)), [rankings])

  const completeRankings = useMemo(() => {
    if (!minDate || !maxDate || !rankings) return []
    const rankingsByDate: { [date: string]: MonthRanking } = {}
    for (const ranking of rankings) {
      rankingsByDate[ranking.timestamp.utc().format('MM-YYYY')] = ranking
    }

    const complete: MonthRanking[] = []

    for (
      let currentMonth = minDate;
      currentMonth < maxDate;
      currentMonth = currentMonth.add(1, 'month')
    ) {
      if (currentMonth.format('MM-YYYY') in rankingsByDate) {
        complete.push(rankingsByDate[currentMonth.format('MM-YYYY')])
      } else {
        complete.push({
          position: 0,
          timeframe: '',
          timestamp: currentMonth,
        })
      }
    }
    return complete
  }, [minDate, maxDate, rankings])

  const gridHeight = useMemo(() => {
    const yearCount = completeRankings.length / 12
    const rowCount = yearCount * (window.innerWidth <= 1200 ? 2 : 1)
    return 60 * rowCount + 30 * yearCount
  }, [completeRankings, isMobile, window.innerWidth])

  return (
    <Card
      style={{
        transition: 'height 0.2s',
        height: 'fit-content',
      }}
    >
      <Stack>
        <Typography>Monthly Rankings</Typography>
        <LoadingContainer loading={loading}>
          <Grid
            container
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              flexDirection: 'row-reverse',
              height: gridHeight,
              minHeight: 100,
              transition: 'height 0.5s',
            }}
          >
            {completeRankings
              ?.map((ranking) => (
                <>
                  {ranking.timestamp.utc().month() === 11 ? (
                    <Grid xs={12} key={`year-${ranking.timestamp.year()}`}>
                      <div style={{ height: 30 }}>{ranking.timestamp.year()}</div>
                    </Grid>
                  ) : undefined}
                  <Grid
                    style={{
                      display: 'flex',
                      textAlign: 'center',
                      flexDirection: 'column',
                      height: 60,
                    }}
                    lg={isMobile ? 2 : 1}
                    md={2}
                    xs={2}
                    key={`ranking-${ranking.timestamp.year()}-${ranking.timestamp.month() + 1}`}
                  >
                    <div
                      style={{
                        margin: '0px 3px',
                        border: '1px solid',
                        borderColor: 'inherit',
                        borderRadius: 5,
                      }}
                    >
                      <div
                        title={`${ranking.timestamp.toISOString()}`}
                        style={{ fontSize: 12, margin: '4px 4px 0px 4px' }}
                      >
                        {ranking.timestamp.utc().format('MMM')}
                      </div>
                      <div
                        style={{
                          fontSize: 16,
                          marginBottom: 2,
                          opacity: ranking.position ? 1 : 0.6,
                          fontWeight:
                            ranking.position && 30 ? 800 - (20 - ranking.position) : undefined,
                          color: ranking.position ? getRankingColor(ranking.position) : 'inherit',
                        }}
                      >
                        {ranking.position > 0 ? `#${ranking.position}` : '--'}
                      </div>
                    </div>
                  </Grid>
                </>
              ))
              .reverse()}
          </Grid>
        </LoadingContainer>
      </Stack>
    </Card>
  )
}
