import { Card, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { max, mean, min, range } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import YearGraph from "../../components/stats/year-graph";
import { GetTrackStats, TrackStats } from "../../service/stats";
import { AuthContext } from "../../state/auth";
import { displayError } from "../../util/errors";

type StreamsByYearAndDate = { [year: number]: { [date: string]: number } };

export default function TrackDetails() {
  const { spotify_uri } = useParams();
  const [authState] = useContext(AuthContext);
  const [error, setError] = useState<string>();
  const [trackData, setTrackData] = useState<TrackStats>();

  const fetchData = useCallback(async () => {
    if (error || !authState.access_token || !spotify_uri) return;
    const response = await GetTrackStats(authState.access_token, spotify_uri);
    if ("error" in response) {
      displayError(response.error);
      setError(response.error);
      return;
    }
    setTrackData(response);
  }, [error, authState, spotify_uri]);

  useEffect(() => {
    if (error || !authState.access_token || trackData) return;
    fetchData();
  }, [authState, error, trackData]);

  useEffect(() => {
    if (error || !authState.access_token) return;
    fetchData();
  }, [spotify_uri, error, authState]);

  const minYear = useMemo(
    () => min(trackData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [trackData]
  ).year();

  const maxYear = useMemo(
    () => max(trackData?.streams?.map((e) => e.timestamp)) ?? dayjs(),
    [trackData]
  ).year();

  const streamsByDate: StreamsByYearAndDate = useMemo(() => {
    const data: StreamsByYearAndDate = {};
    trackData?.streams.forEach((stream) => {
      const dateString = stream.timestamp.format("YYYY-MM-DD");
      const streamYear = stream.timestamp.year();
      if (!(streamYear in data)) {
        data[streamYear] = {};
      }
      if (dateString in data[streamYear]) {
        data[streamYear][dateString]++;
      } else {
        data[streamYear][dateString] = 1;
      }
    });
    return data;
  }, [trackData]);

  const maxCount = useMemo(
    () =>
      max(
        Object.entries(streamsByDate).flatMap(([, yearStreams]) =>
          Object.entries(yearStreams).map(([, count]) => count)
        )
      ),
    [streamsByDate]
  );

  const averageTimeOfDayHours = useMemo(
    () =>
      trackData
        ? mean(
            trackData.streams.map(
              (stream) =>
                stream.timestamp.hour() + stream.timestamp.minute() / 60
            )
          )
        : 0,
    [trackData]
  );

  return (
    trackData && (
      <Grid container columnSpacing={2} rowSpacing={2} width="100%" padding={2}>
        <Grid item xs={6}>
          <Stack>
            <Card>
              <Stack direction="row">
                <img
                  src={trackData.track.album.images[0].url}
                  height={128}
                  width={128}
                />
                <Stack>
                  <Typography variant="h5">{trackData.track.name}</Typography>
                  {spotify_uri}
                  <Typography variant="h6">
                    {trackData.track.artists
                      .map((artist) => artist.name)
                      .join(", ")}
                  </Typography>
                  <Typography variant="body1">
                    {trackData.streams.length} streams
                  </Typography>
                </Stack>
              </Stack>
            </Card>
            <Card>
              <Stack>
                <div>
                  First Stream:{" "}
                  {trackData.streams[0].timestamp.format("MMM DD, YYYY")}
                </div>
                <div>
                  Average Time of Day:{" "}
                  {`00-01-01 ${averageTimeOfDayHours.toPrecision(2)}:${(
                    (averageTimeOfDayHours * 60) %
                    60
                  )
                    .toFixed(0)
                    .padStart(2, "0")}`}
                </div>
                <div>
                  Average Time of Day:{" "}
                  {dayjs(
                    `00-01-01 ${averageTimeOfDayHours.toPrecision(2)}:${(
                      (averageTimeOfDayHours * 60) %
                      60
                    )
                      .toFixed(0)
                      .padStart(2, "0")}`,
                    "yy-MM-dd HH:mm"
                  )
                    .utc(true)
                    .tz()
                    .format("h:mm a")}
                </div>
                <Typography variant="body1">
                  {trackData.streams.length} streams
                </Typography>
              </Stack>
            </Card>
            <Card>
              <Stack>
                <Typography>Monthly Rankings</Typography>
                {trackData.rankings
                  .map((ranking) => (
                    <div>
                      {dayjs(
                        new Date(ranking.year, ranking.month - 1, 1)
                      ).format("MMM YYYY")}
                      : #{ranking.position}
                    </div>
                  ))
                  .reverse()}
              </Stack>
            </Card>
          </Stack>
        </Grid>
        <Grid item xs={6} height="100%">
          <Card style={{ overflowY: "hidden", height: "100%" }}>
            <Typography>All Streams</Typography>
            <div style={{ overflowY: "auto", height: "100%" }}>
              {range(maxYear, minYear - 1, -1).map((year) => {
                const yearData = Object.entries(streamsByDate[year] ?? {}).map(
                  ([date, count]) => ({
                    date: dayjs(date).toDate(),
                    count,
                  })
                );
                return yearData.length ? (
                  <YearGraph
                    key={year}
                    year={year}
                    data={yearData}
                    maxCount={maxCount ?? 10}
                  />
                ) : (
                  <div />
                );
              })}
            </div>
          </Card>
        </Grid>
      </Grid>
    )
  );
}
