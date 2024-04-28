import dayjs from "dayjs";
import { min, max, range } from "lodash";
import { useState, useContext, useMemo, useEffect } from "react";
import YearGraph from "../../components/stats/year-graph";
import { GetAllHistory } from "../../service/stats";
import { AuthContext } from "../../state/auth";
import { MinEntry, StreamingData } from "../../types/stats";
import { displayError } from "../../util/errors";

export default function SongStatsPage() {
  const [selectedSong, setSelectedSong] = useState<string>();
  const [selectedArtist, setSelectedArtist] = useState<string>();
  const [authState] = useContext(AuthContext);
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [historyEntries, setHistoryEntries] = useState<MinEntry[]>();
  const minYear = useMemo(
    () => min(historyEntries?.map((e) => dayjs(e.timestamp))) ?? dayjs(),
    [historyEntries]
  ).year();
  const maxYear = useMemo(
    () => max(historyEntries?.map((e) => dayjs(e.timestamp))) ?? dayjs(),
    [historyEntries]
  ).year();

  useEffect(() => {
    if (loading || error || !authState.access_token || historyEntries) return;
    setLoading(true);
    GetAllHistory(authState.access_token).then((response) => {
      setLoading(false);
      if ("error" in response) {
        displayError(response.error);
        setError(response.error);
        return;
      }
      setHistoryEntries(response);
      return;
    });
  }, [authState, error, historyEntries]);

  const metadata: StreamingData = useMemo(() => {
    const md: StreamingData = {
      count: historyEntries?.length ?? 0,
      entries: {},
      bySongAndDate: {},
      byArtistAndDate: {},
    };
    historyEntries?.forEach((entry) => {
      const dateString = entry.timestamp.format("YYYY-MM-DD");
      if (entry.track_name in md.entries) {
        md.entries[entry.track_name].push(entry);
      } else {
        md.entries[entry.track_name] = [entry];
      }
      if (!(entry.track_name in md.bySongAndDate)) {
        md.bySongAndDate[entry.track_name] = {};
      }
      if (dateString in md.bySongAndDate[entry.track_name]) {
        md.bySongAndDate[entry.track_name][dateString].push(entry);
      } else {
        md.bySongAndDate[entry.track_name][dateString] = [entry];
      }
      if (!(entry.artist_name in md.byArtistAndDate)) {
        md.byArtistAndDate[entry.artist_name] = {};
      }
      if (dateString in md.byArtistAndDate[entry.artist_name]) {
        md.byArtistAndDate[entry.artist_name][dateString].push(entry);
      } else {
        md.byArtistAndDate[entry.artist_name][dateString] = [entry];
      }
    });
    return md;
  }, [historyEntries, selectedArtist, selectedSong]);

  const maxCount = useMemo(
    () =>
      selectedSong && selectedSong in metadata.bySongAndDate
        ? max(
            Object.entries(metadata.bySongAndDate[selectedSong]).map(
              ([, entries]) => entries.length
            )
          )
        : selectedArtist && selectedArtist in metadata.byArtistAndDate
        ? max(
            Object.entries(metadata.byArtistAndDate[selectedArtist]).map(
              ([, entries]) => entries.length
            )
          )
        : 10,
    [selectedSong, selectedArtist, metadata]
  );

  return (
    <div style={{ width: "100%" }}>
      <label>
        Song Name:
        <input
          style={{ marginBottom: 16 }}
          list="songs"
          name="song"
          id="song"
          value={selectedSong}
          onChange={(e) => {
            setSelectedArtist("");
            setSelectedSong(e.target.value);
          }}
        />
      </label>
      <label>
        Artist Name:
        <input
          style={{ marginBottom: 16 }}
          list="artists"
          name="artist"
          id="artist"
          value={selectedArtist}
          onChange={(e) => {
            setSelectedArtist(e.target.value);
            setSelectedSong("");
          }}
        />
      </label>

      <datalist id="songs">
        {Object.keys(metadata.bySongAndDate).map((song, i) => (
          <option value={song} key={`${song}-${i}`} />
        ))}
      </datalist>
      <datalist id="artists">
        {Object.keys(metadata.byArtistAndDate).map((artist, i) => (
          <option value={artist} key={`${artist}-${i}`} />
        ))}
      </datalist>
      <div style={{ overflowY: "scroll", flex: 1 }}>
        {range(minYear, maxYear + 1).map((year) => {
          const data =
            selectedSong && selectedSong in metadata.bySongAndDate
              ? Object.entries(metadata.bySongAndDate[selectedSong])
                  .filter(([date]) => dayjs(date).year() === year)
                  .map(([date, entries]) => ({
                    date: dayjs(date).toDate(),
                    count: entries.length,
                  }))
              : selectedArtist && selectedArtist in metadata.byArtistAndDate
              ? Object.entries(metadata.byArtistAndDate[selectedArtist])
                  .filter(([date]) => dayjs(date).year() === year)
                  .map(([date, entries]) => ({
                    date: dayjs(date).toDate(),
                    count: entries.length,
                  }))
              : [];
          return data.length ? (
            <YearGraph
              key={year}
              year={year}
              data={data}
              maxCount={maxCount ?? 10}
            />
          ) : (
            <div />
          );
        })}
      </div>
    </div>
  );
}
