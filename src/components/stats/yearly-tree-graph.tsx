import { max } from "lodash";
import { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { ErrorBoundary } from "react-error-boundary";
import { StreamCount } from "../../types/stats";

type ArtistsTreeProps = {
  year: number;
  data: StreamCount[];
};

export default function ArtistsTree(props: ArtistsTreeProps) {
  const { year, data } = props;

  const chart = useMemo(
    () => (
      <ReactApexChart
        options={{
          legend: {
            show: true,
          },
          chart: {
            height: 300,
            type: "treemap",
          },
          title: {
            text: year.toString(),
          },
          dataLabels: {
            enabled: true,
          },
          plotOptions: {
            treemap: {
              dataLabels: {
                format: "scale",
              },
              distributed: true,
            },
          },
        }}
        series={[
          {
            name: year.toString(),
            data: data.map((datum) => ({
              x: datum.name ?? "(no name)",
              y: datum.count,
            })),
          },
        ]}
        type="treemap"
        height={300}
      />
    ),
    [data, year, max]
  );
  return (
    <div style={{ position: "relative" }}>
      <div>{year}</div>
      <div style={{ color: "black" }}>
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          {chart}
        </ErrorBoundary>
      </div>
    </div>
  );
}
