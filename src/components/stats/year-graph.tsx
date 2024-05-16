import { Card, Dialog, Typography } from '@mui/material'
import dayjs, { Dayjs } from 'dayjs'
import { round, sum } from 'lodash'
import { useMemo, useState } from 'react'
import { ErrorBoundary } from 'react-error-boundary'

export type ItemCounts = { [item: string]: number }

type YearGraphProps =
  | {
      year: number
      data: { date: Dayjs; itemCounts: ItemCounts }[]
      maxCount: number
    }
  | {
      year: number
      data: { date: Dayjs; count: number }[]
      maxCount: number
    }

const SQUARE_SIDE = 18

export default function YearGraph(props: YearGraphProps) {
  const { year, data, maxCount } = props
  const [listItems, setListItems] = useState<string[]>()

  const countsByDate = useMemo(() => {
    const sortedData = data.sort((a, b) => a.date.diff(b.date))

    const counts: { [date: string]: ItemCounts | number } = {}
    let date = dayjs(new Date(year, 0, 1))
    let dataIndex = 0
    while (date.year() === year) {
      const nextDatum = dataIndex < sortedData.length ? sortedData[dataIndex] : undefined
      // console.log(date.toString(), nextDatum?.date.toString());
      if (
        nextDatum &&
        date.month() === nextDatum.date.month() &&
        date.date() === nextDatum.date.date()
      ) {
        counts[date.toDate().toDateString()] =
          'itemCounts' in nextDatum ? nextDatum.itemCounts : nextDatum.count
        dataIndex++
      } else {
        counts[date.toDate().toDateString()] = {}
      }
      date = date.add(1, 'day')
    }
    return counts
  }, [data, year, maxCount])

  return (
    <div>
      <div>{year}</div>
      <div>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <div
            style={{
              width: '100%',
              height: 24 + SQUARE_SIDE * 8,
            }}
          >
            <div
              style={{
                display: 'flex',
                height: 24 + SQUARE_SIDE * 8,
                flexWrap: 'wrap',
                flexDirection: 'column',
                overflowX: 'auto',
                overflowY: 'visible',
                position: 'relative',
                alignContent: 'start',
              }}
            >
              {Object.entries(countsByDate)
                .slice(0, 7)
                .map(([date]) => (
                  <Typography
                    style={{
                      height: SQUARE_SIDE,
                      margin: 1,
                      fontSize: 14,
                      width: 40,
                    }}
                  >
                    {dayjs(date).format('ddd')}
                  </Typography>
                ))}
              <div style={{ height: 24 }}></div>
              {Object.entries(countsByDate).map(([dateStr, countVal], i) => (
                <>
                  {typeof countVal === 'number' ? (
                    <CountSquare dateStr={dateStr} count={countVal} maxCount={maxCount} />
                  ) : (
                    <CountSquare
                      dateStr={dateStr}
                      itemCounts={countVal}
                      maxCount={maxCount}
                      onClick={() => {
                        Object.values(countVal).length > 0 &&
                          setListItems([
                            dayjs(dateStr).format('MM/DD/YYYY'),
                            ...(Object.entries(countVal)
                              ?.sort(([, a], [, b]) => b - a)
                              ?.map(([item, count]) => `${item} (${count})`) ?? []),
                          ])
                      }}
                    />
                  )}
                  {i % 7 === 6 ? (
                    dayjs(dateStr).date() <= 7 ? (
                      <div style={{ height: 24, width: SQUARE_SIDE }} title={i.toString()}>
                        {dayjs(dateStr).format('MMM')}
                      </div>
                    ) : (
                      <div style={{ height: 24 }}></div>
                    )
                  ) : (
                    <div />
                  )}
                </>
              ))}
            </div>
            <Dialog
              open={!!listItems}
              onClose={() => {
                setListItems(undefined)
              }}
            >
              <Card>{listItems?.map((item) => <div key={item}>{item}</div>)}</Card>
            </Dialog>
          </div>
        </ErrorBoundary>
      </div>
    </div>
  )
}

type CountSquareProps =
  | {
      dateStr: string
      itemCounts: ItemCounts
      maxCount: number
      onClick?: (event: React.MouseEvent<HTMLElement>) => void
    }
  | {
      dateStr: string
      count: number
      maxCount: number
      onClick?: (event: React.MouseEvent<HTMLElement>) => void
    }

const EXPONENT = 4

function weightInput(input: number) {
  // return input ** EXPONENT;
  return input ** EXPONENT
}

function formatColorNum(input: number) {
  return input.toString(16).padStart(2, '0')
}

function CountSquare(props: CountSquareProps) {
  const { dateStr, maxCount, onClick } = props
  const total = 'count' in props ? props.count : sum(Object.values(props.itemCounts))
  const weighted = round(weightInput((maxCount - total + 4) / (maxCount + 4)) * 140 + 100)
  const backgroundColor = total
    ? `#${formatColorNum(weighted)}00${formatColorNum(weighted)}`
    : dayjs(dateStr).month() % 2
      ? '#666'
      : '#777'
  const [hovered, setHovered] = useState(false)
  return (
    <div
      key={dateStr}
      style={{
        aspectRatio: 1,
        backgroundColor,
        color: 'white',
        height: SQUARE_SIDE + (hovered ? 2 : 0),
        width: SQUARE_SIDE + (hovered ? 2 : 0),
        margin: hovered ? 0 : 1,
        fontSize: 12,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: total ? 'pointer' : undefined,
        transition: 'margin 0.2s, height 0.2s, width 0.2s',
      }}
      onClick={onClick}
      onMouseEnter={() => total && setHovered(true)}
      onMouseLeave={() => total && setHovered(false)}
    >
      {total ? total : ''}
    </div>
  )
}
