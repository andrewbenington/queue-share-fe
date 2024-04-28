import { Card, Grid, Stack, Typography } from "@mui/material";
import { MonthlySongRanking } from "../../service/stats";
import dayjs from "dayjs";
import { Song } from "../song";

type ArtistsTreeProps = {
  year: number;
  data: MonthlySongRanking[];
};

export default function YearSongMonthlyRankings(props: ArtistsTreeProps) {
  const { year, data } = props;

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }}>{year}</Typography>
      <Stack direction="row" style={{ overflowX: "auto" }}>
        {data.map((songRankings) => (
          <Stack spacing={0}>
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              {dayjs()
                .month(songRankings.month - 1)
                .format("MMMM")}
            </Typography>
            {songRankings.songs.map((song, i) => (
              <Grid container>
                <Grid item xs={1}>
                  {i + 1}.
                </Grid>
                <Grid item xs={11} style={{ width: 300, fontSize: 12 }}>
                  <Song
                    song={song.track}
                    imageSize={48}
                    cardVariant="outlined"
                    rightComponent={<div>({song.play_count} streams)</div>}
                    link
                  />
                </Grid>
              </Grid>
            ))}
          </Stack>
        ))}
      </Stack>
    </Card>
  );
}
