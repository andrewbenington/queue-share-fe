import { ArrowBack, ArrowForward } from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/joy'
import dayjs, { Dayjs } from 'dayjs'
import _ from 'lodash'
import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import LoadingContainer from '../loading-container'

export type Event = {
  name: string
  color: string
}

export type EventMap = { [date: string]: JSX.Element[] }

type CalendarProps = {
  events: EventMap
  onDateChange?: (month: number, year: number) => void
  loading?: boolean
}

const monthNamesLowercase = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
]

export default function Calendar(props: CalendarProps) {
  const { events, onDateChange, loading } = props
  const [searchParams, setSearchParams] = useSearchParams()

  const year = useMemo(() => {
    const yearString = searchParams.get('year')
    if (!yearString) return new Date().getFullYear()
    return parseInt(yearString)
  }, [searchParams])

  const month = useMemo(() => {
    const monthString = searchParams.get('month')
    const monthIndex = monthNamesLowercase.indexOf(monthString?.toLowerCase() ?? '')
    if (monthIndex < 0) return new Date().getMonth()
    return monthIndex
  }, [searchParams])

  const startDate = useMemo(() => dayjs(new Date(year, month, 1)), [year, month])
  const endDate = useMemo(() => {
    if (month === 11) {
      return dayjs(new Date(year + 1, 0, 0))
    }
    return dayjs(new Date(year, month + 1, 0))
  }, [year, month])

  const weeks: (Dayjs | null)[][] = useMemo(() => {
    const weekList: (Dayjs | null)[][] = []
    let currentWeek: (Dayjs | null)[] = []
    for (let i = 0; i < startDate.day(); i++) {
      currentWeek.push(null)
    }
    for (let i = 0; i < endDate.date(); i++) {
      const currentDate = startDate.add(i, 'days')
      currentWeek.push(currentDate)
      if (currentDate.day() === 6) {
        weekList.push(currentWeek)
        currentWeek = []
      }
    }
    if (currentWeek.length > 0) {
      weekList.push(currentWeek)
    }
    return weekList
  }, [startDate, endDate])

  function decrementMonth() {
    const newStart = startDate.subtract(1, 'month')
    setDateSearchParams(newStart)
    onDateChange && onDateChange(newStart.month(), newStart.year())
  }

  function incrementMonth() {
    const newStart = startDate.add(1, 'month')
    setDateSearchParams(newStart)
    onDateChange && onDateChange(newStart.month(), newStart.year())
  }

  function goToToday() {
    const newStart = dayjs()
    setDateSearchParams(newStart)
    onDateChange && onDateChange(newStart.month(), newStart.year())
  }

  function setDateSearchParams(date: Dayjs) {
    searchParams.set('year', date.year().toString())
    searchParams.set('month', monthNamesLowercase[date.month()].toString())
    setSearchParams(searchParams)
  }

  function capitalizeFirst(value: string) {
    return value.substring(0, 1).toLocaleUpperCase() + value.substring(1)
  }
  return (
    <LoadingContainer loading={loading} overlay>
      <table
        style={{
          width: '100%',
        }}
      >
        <thead>
          <tr>
            <th colSpan={7}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: 8,
                }}
              >
                <Button onClick={decrementMonth} style={{ minWidth: 0, marginRight: 8 }} size="sm">
                  <ArrowBack />
                </Button>
                <select
                  value={month}
                  style={{ fontWeight: 'bold', fontSize: 16 }}
                  onChange={(e) =>
                    typeof e.target.value === 'string' &&
                    setSearchParams({
                      month: monthNamesLowercase[parseInt(e.target.value)],
                      year: year.toString(),
                    })
                  }
                >
                  {monthNamesLowercase.map((monthStr, idx) => (
                    <option value={idx}>{capitalizeFirst(monthStr)}</option>
                  ))}
                </select>
                <select
                  value={year}
                  style={{ fontWeight: 'bold', fontSize: 16 }}
                  onChange={(e) =>
                    setSearchParams({
                      month: monthNamesLowercase[month],
                      year: e.target.value,
                    })
                  }
                >
                  {_.range(2022, new Date().getFullYear() + 1).map((year) => (
                    <option value={year}>
                      <Typography fontWeight="bold">{year}</Typography>
                    </option>
                  ))}
                </select>
                <Button onClick={incrementMonth} style={{ minWidth: 0, marginLeft: 8 }} size="sm">
                  <ArrowForward />
                </Button>
                <Button
                  onClick={goToToday}
                  style={{
                    minWidth: 0,
                    marginLeft: 8,
                    position: 'absolute',
                    right: 0,
                  }}
                  size="sm"
                >
                  Today
                </Button>
              </div>
            </th>
          </tr>
          <tr>
            <th>Sun</th>
            <th>Mon</th>
            <th>Tues</th>
            <th>Wed</th>
            <th>Thurs</th>
            <th>Fri</th>
            <th>Sat</th>
          </tr>
        </thead>
        <tbody
          style={{
            borderWidth: 1,
            borderStyle: 'solid',
            borderRadius: 5,
          }}
        >
          {weeks.map((week, weekIdx) => (
            <tr style={{ height: 100 }} key={`week_${weekIdx}`}>
              {week.map((date, dayIdx) => (
                <td
                  key={`week_${weekIdx}_day_${dayIdx}`}
                  style={{
                    width: `${100 / 7}%`,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    // borderColor: "white",
                    verticalAlign: 'top',
                    height: '100%',
                    // display: "grid",
                    // justifyContent: "start",
                    backgroundColor: dateIsToday(date) ? '#f663' : undefined,
                  }}
                >
                  <Typography fontWeight="bold" paddingLeft={1} paddingTop={0.5}>
                    {date?.date()}
                  </Typography>
                  {events && date && date?.format('YYYY-MM-DD') in events && (
                    <Box display="flex" flexWrap="wrap" style={{ marginLeft: 4 }}>
                      {events[date?.format('YYYY-MM-DD')]}
                    </Box>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </LoadingContainer>
  )
}

function dateIsToday(date?: Dayjs | null) {
  if (!date) return false
  const today = dayjs()
  return (
    date.date() === today.date() && date.month() === today.month() && date.year() === today.year()
  )
}
