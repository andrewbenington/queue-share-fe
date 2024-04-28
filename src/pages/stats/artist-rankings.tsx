import { Card, Checkbox, TextField } from "@mui/material";
import Stack from "@mui/material/Stack/Stack";
import dayjs from "dayjs";
import { max, min, range } from "lodash";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import LoadingButton from "../../components/loading_button";
import LoadingContainer from "../../components/loading_container";
import YearArtistRankings from "../../components/stats/artists-by-month";
import { GetArtistsByMonth, MonthlyArtistRanking } from "../../service/stats";
import { AuthContext } from "../../state/auth";
import { displayError } from "../../util/errors";

export default function ArtistRankingsPage() {
  const [authState] = useContext(AuthContext);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [artistsByMonth, setArtistsByMonth] =
    useState<MonthlyArtistRanking[]>();
  const minYear = useMemo(
    () => min(artistsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [artistsByMonth]
  );
  const maxYear = useMemo(
    () => max(artistsByMonth?.map((month) => month.year)) ?? dayjs().year(),
    [artistsByMonth]
  );
  const [minStreamTime, setMinStreamTime] = useState<number>(30);
  const [excludeSkips, setExcludeSkips] = useState(true);

  const fetchData = useCallback(async () => {
    if (loading || error || !authState.access_token) return;
    setLoading(true);
    const response = await GetArtistsByMonth(
      authState.access_token,
      minStreamTime,
      excludeSkips
    );
    setLoading(false);
    if ("error" in response) {
      displayError(response.error);
      setError(response.error);
      return;
    }
    setArtistsByMonth(response);
    return;
  }, [loading, error, authState, minStreamTime, excludeSkips]);

  useEffect(() => {
    if (loading || error || !authState.access_token || artistsByMonth) return;
    fetchData();
  }, [authState, error, artistsByMonth, minStreamTime, excludeSkips]);

  return (
    <div style={{ overflowY: "scroll", width: "100%", padding: 16 }}>
      <Stack>
        <Card>
          <Stack direction="row">
            <TextField
              label={"Minimum Stream Time (seconds)"}
              type="number"
              value={minStreamTime}
              onChange={(e) => setMinStreamTime(parseFloat(e.target.value))}
            />
            <label>
              Exclude Skips
              <Checkbox
                checked={excludeSkips}
                onChange={(e) => setExcludeSkips(e.target.checked)}
              />
            </label>
            <LoadingButton onClickAsync={fetchData}>Reload</LoadingButton>
          </Stack>
        </Card>
        <LoadingContainer loading={loading && !artistsByMonth}>
          <Stack>
            {range(maxYear, minYear - 1, -1).map((year) => {
              const data = artistsByMonth?.filter((data) => data.year === year);
              return data?.length ? (
                <YearArtistRankings key={year} year={year} data={data} />
              ) : (
                <div />
              );
            })}
          </Stack>
        </LoadingContainer>
      </Stack>
    </div>
  );
}
