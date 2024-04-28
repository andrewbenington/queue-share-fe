import dayjs from "dayjs";
import { max } from "lodash";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ErrorBoundary } from "react-error-boundary";

type YearGraphProps = {
  year: number;
  data: { date: Date; count: number }[];
  maxCount: number;
};

export default function YearGraph(props: YearGraphProps) {
  const { year, data, maxCount } = props;

  const chart = useMemo(
    () => (
      <ReactApexChart
        options={{
          chart: {
            type: "scatter",
            zoom: {
              enabled: true,
              type: "xy",
            },
          },

          dataLabels: {
            enabled: false,
          },
          xaxis: {
            type: "datetime",
            labels: {
              formatter: (_, timestamp) => dayjs(timestamp).format("MMM DD"),
            },
            min: new Date(year, 0, 1).getTime(),
            max: new Date(year, 11, 31).getTime(),
          },
          yaxis: {
            max: maxCount,
            min: 0,
          },
        }}
        series={[
          {
            name: year.toString(),
            data: data.map((datum) => [datum.date.getTime(), datum.count]),
          },
        ]}
        type="scatter"
        height={200}
      />
    ),
    [data, year, max]
  );
  return (
    <div style={{ height: 250, position: "relative" }}>
      <div>{year}</div>
      <div style={{ color: "black" }}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          {chart}
        </ErrorBoundary>
      </div>
    </div>
  );
}
