import { useCallback, useMemo } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ErrorBoundary } from 'react-error-boundary'
import { AlbumRanking } from '../../service/stats/albums'
import { ArtistRanking } from '../../service/stats/artists'
import { TrackRanking } from '../../service/stats/tracks'

type ArtistsTreeProps = {
  year: number
  data: TrackRanking[] | ArtistRanking[] | AlbumRanking[]
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

  return chunks.join('\n')
}

export default function CountTreeGraph(props: ArtistsTreeProps) {
  const { year, data } = props

  const renderTooltip = useCallback(
    ({ dataPointIndex }: { dataPointIndex: number }) => {
      const datum = data[dataPointIndex]
      if ('track' in datum) {
        return `<div class="MuiBox-root css-q5fnwh" data-first-child="" data-last-child=""><img src="https://i.scdn.co/image/ab67616d0000b27388e3822cccfb8f2832c70c2e" alt="Sympathy is a knife" width="48" height="48" style="border-top-left-radius: 3px; border-bottom-left-radius: 3px;"><div class="MuiBox-root css-m5b0nr" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold;" href="/stats/track/spotify:track:5c9tBmJKbTdn1vhzXHeAwW">${datum.track.name}</a><div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" href="/stats/artist/spotify:artist:25uiPmTg16RbhZWAqwLBy5">Charli xcx</a></div></div><div style="display: flex; flex-direction: column; text-align: right;"><b>x31</b></div></div>`
      }
      if ('artist' in datum) {
        return `<div class="MuiGrid-root MuiGrid-direction-xs-row MuiGrid-grid-xs-10 css-lshbo4-JoyGrid-root" style="font-size: 12px; -webkit-box-flex:0;
  -webkit-flex-grow:0;
  -ms-flex-positive:0;
  flex-grow:0;
  -webkit-flex-basis:auto;
  -ms-flex-preferred-size:auto;
  flex-basis:auto;
  width:calc(100% * 10 / var(--Grid-columns));
  min-width:0;
  box-sizing:border-box;
  padding:calc(var(--Grid-rowSpacing) / 2) calc(var(--Grid-columnSpacing) / 2);"><div class="MuiCard-root MuiCard-vertical MuiCard-variantOutlined MuiCard-colorNeutral MuiCard-sizeMd css-14ea6pg-JoyCard-root" style="--Icon-color:var(--joy-palette-text-icon);
  --Card-childRadius:max((var(--Card-radius) - var(--variant-borderWidth, 0px)) - var(--Card-padding), min(var(--Card-padding) / 2, (var(--Card-radius) - var(--variant-borderWidth, 0px)) / 2));
  --AspectRatio-radius:var(--Card-childRadius);
  --unstable_actionMargin:calc(-1 * var(--variant-borderWidth, 0px));
  --unstable_actionRadius:var(--Card-radius);
  --CardCover-radius:calc(var(--Card-radius) - var(--variant-borderWidth, 0px));
  --CardOverflow-offset:calc(-1 * var(--Card-padding));
  --CardOverflow-radius:calc(var(--Card-radius) - var(--variant-borderWidth, 0px));
  --Divider-inset:calc(-1 * var(--Card-padding));
  --Card-padding:1rem;
  gap:0.75rem 1rem;
  border-radius:var(--Card-radius);
  background-color:var(--joy-palette-background-surface);
  position:relative;
  display:-webkit-box;
  display:-webkit-flex;
  display:-ms-flexbox;
  display:flex;
  -webkit-flex-direction:column;
  -ms-flex-direction:column;
  flex-direction:column;
  font-family:var(--joy-fontFamily-body, "Inter", var(--joy-fontFamily-fallback, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"));
  font-size:var(--joy-fontSize-md, 1rem);
  line-height:var(--joy-lineHeight-md, 1.5);
  color:var(--variant-outlinedColor, var(--joy-palette-neutral-outlinedColor, var(--joy-palette-neutral-700, #32383E)));
  --variant-borderWidth:1px;
  border:var(--variant-borderWidth) solid;
  border-color:var(--variant-outlinedBorder, var(--joy-palette-neutral-outlinedBorder, var(--joy-palette-neutral-300, #CDD7E1)));
  overflow:hidden;
  font-size:11px;">
  <div class="MuiBox-root css-q5fnwh" data-first-child="" data-last-child="" style="display:-webkit-box;
  display:-webkit-flex;
  display:-ms-flexbox;
  display:flex;
  -webkit-align-items:center;
  -webkit-box-align:center;
  -ms-flex-align:center;
  align-items:center;
  padding-right:calc(1 * var(--joy-spacing));"><img src="${datum.artist.image_url}" alt="Charli XCX" width="48" height="48" style="border-top-left-radius: 3px; border-bottom-left-radius: 3px; margin-right: 8px;"><div class="MuiBox-root css-m5b0nr" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><a style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; color: white;" href="/stats/artist/spotify:artist:${datum.artist.id}">${datum.artist.name}</a><div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: white">Popularity: ${datum.artist.popularity}</div></div></div></div></div>`
      }
      return '<div class="arrow_box">' + '<span>' + datum.album.name + '</span>' + '</div>'
    },
    [data]
  )

  const chart = useMemo(
    () => (
      <ReactApexChart
        options={{
          legend: {
            show: true,
          },
          chart: {
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
                format: 'truncate',
              },
              distributed: true,
            },
          },
          tooltip: {
            custom: renderTooltip,
          },
        }}
        series={[
          {
            name: year.toString(),
            data: data.map((datum) => {
              if ('track' in datum) {
                return {
                  x: `${datum.rank}. ${splitTitle(datum.track.name)}`,
                  y: datum.stream_count,
                }
              }
              if ('artist' in datum) {
                return {
                  x: `${datum.rank}. ${splitTitle(datum.artist.name)}`,
                  y: datum.stream_count,
                }
              }
              return {
                x: `${datum.rank}. ${splitTitle(datum.album.name)}`,
                y: datum.stream_count,
              }
            }),
          },
        ]}
        type="treemap"
        height={500}
      />
    ),
    [year, renderTooltip, data]
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
