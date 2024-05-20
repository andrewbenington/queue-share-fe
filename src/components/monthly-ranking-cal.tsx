import { Card, Grid, Stack, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { round } from 'lodash'
import { useMemo } from 'react'
import useIsMobile from '../hooks/is_mobile'
import { MonthRanking } from '../service/stats'
import LoadingContainer from './loading-container'

function dateFromRanking(ranking: MonthRanking) {
  return dayjs(new Date(ranking.year, ranking.month - 1, 1))
}

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
      const rankingDate = dateFromRanking(ranking)
      rankingsByDate[rankingDate.format('MM-YYYY')] = ranking
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
          year: currentMonth.year(),
          month: currentMonth.month() + 1,
          position: 0,
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
                  {ranking.month === 12 ? (
                    <Grid item xs={12} key={`year-${ranking.year}`}>
                      <div style={{ height: 30 }}>{ranking.year}</div>
                    </Grid>
                  ) : undefined}
                  <Grid
                    item
                    style={{
                      display: 'flex',
                      textAlign: 'center',
                      flexDirection: 'column',
                      height: 60,
                    }}
                    lg={isMobile ? 2 : 1}
                    md={2}
                    xs={2}
                    key={`ranking-${ranking.year}-${ranking.month}`}
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
                        title={`${ranking.month} - ${ranking.year}`}
                        style={{ fontSize: 12, margin: '4px 4px 0px 4px' }}
                      >
                        {dayjs(new Date(ranking.year, ranking.month - 1, 5)).format('MMM')}
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
