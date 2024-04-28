import { Card, Grid, Stack, Typography } from "@mui/material";
import dayjs from "dayjs";
import { MonthlyArtistRanking } from "../../service/stats";
import { ArtistDisplay } from "../artist_display";

type ArtistsTreeProps = {
  year: number;
  data: MonthlyArtistRanking[];
};

export default function YearArtistRankings(props: ArtistsTreeProps) {
  const { year, data } = props;

  return (
    <Card>
      <Typography style={{ marginBottom: 8 }}>{year}</Typography>
      <Stack direction="row" style={{ overflowX: "auto" }}>
        {data.map((artistRankings) => (
          <Stack spacing={0}>
            <Typography variant="h6" style={{ marginBottom: 8 }}>
              {dayjs()
                .month(artistRankings.month - 1)
                .format("MMMM")}
            </Typography>
            {artistRankings.artists.map((artist, i) => (
              <Grid container>
                <Grid item xs={1}>
                  {i + 1}.
                </Grid>
                <Grid item xs={11} style={{ width: 300, fontSize: 12 }}>
                  <ArtistDisplay
                    artist={artist.artist}
                    imageSize={48}
                    cardVariant="outlined"
                    rightComponent={<div>({artist.play_count} streams)</div>}
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
