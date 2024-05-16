import { max } from 'lodash'
import { useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ErrorBoundary } from 'react-error-boundary'
import { StreamCount } from '../../types/stats'

type ArtistsTreeProps = {
  year: number
  data: StreamCount[]
}

function splitTitle(title: string) {
  const chunks: string[] = []
  let currentChunk = ''

  for (let i = 0; i < title.length; i++) {
    currentChunk += title[i]

    if (currentChunk.length > 15 && title[i] === ' ') {
      chunks.push(currentChunk.slice(0, -1))
      currentChunk = ''
    } else if (currentChunk.length > 15 && (title[i] === ',' || title[i] === ':')) {
      chunks.push(currentChunk)
      currentChunk = ''
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk)
  }

  return chunks
}

export default function ArtistsTree(props: ArtistsTreeProps) {
  const { year, data } = props

  const chart = useMemo(
    () => (
      <ReactApexChart
        options={{
          legend: {
            show: true,
          },
          chart: {
            height: 300,
            type: 'treemap',
          },
          title: {
            text: year.toString(),
            floating: true,
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            treemap: {
              dataLabels: {
                format: 'scale',
              },
              distributed: true,
            },
          },
        }}
        series={[
          {
            name: year.toString(),
            data: data.map((datum) => ({
              x: datum.name ? splitTitle(datum.name) : '(no name)',
              y: datum.count,
            })),
          },
        ]}
        type="treemap"
        height={300}
      />
    ),
    [data, year, max]
  )
  return (
    <div style={{ position: 'relative' }}>
      <div>{year}</div>
      <div style={{ color: 'black' }}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>{chart}</ErrorBoundary>
      </div>
    </div>
  )
}
