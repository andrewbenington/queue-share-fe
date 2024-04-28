import dayjs from "dayjs";
import { Artist, Track } from "spotify-types";
import { MinEntry, StreamCount } from "../types/stats";
import { DoRequest, DoRequestWithToken } from "../util/requests";

type MinEntryResponse = Omit<MinEntry, "timestamp"> & { timestamp: string };

export async function UploadHistory(token: string, file: Blob) {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Access-Control-Allow-Origin": "*",
    },
    body: file,
  };
  try {
    return await DoRequest<null>(`/stats/upload`, requestOptions);
  } catch (e) {
    return { error: JSON.stringify(e) };
  }
}

export async function GetAllHistory(token: string) {
  const response = await DoRequestWithToken<MinEntryResponse[]>(
    `/stats/history`,
    "GET",
    token
  );
  if ("error" in response) return response;
  return response.map((entry) => ({
    ...entry,
    timestamp: dayjs(entry.timestamp),
  }));
}

export type SongRanking = {
  spotify_uri: string;
  play_count: number;
  track: Track;
};

export type MonthlySongRanking = {
  year: number;
  month: number;
  songs: SongRanking[];
};

export async function GetSongsByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0);
  return DoRequestWithToken<MonthlySongRanking[]>(
    `/stats/songs-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    "GET",
    token
  );
}

export type ArtistRanking = {
  spotify_uri: string;
  play_count: number;
  artist: Artist;
};

export type MonthlyArtistRanking = {
  year: number;
  month: number;
  artists: ArtistRanking[];
};

export async function GetArtistsByMonth(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0);
  return DoRequestWithToken<MonthlyArtistRanking[]>(
    `/stats/artists-by-month?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    "GET",
    token
  );
}

export type StreamsByYear = {
  [year: number]: StreamCount[];
};

export async function GetArtistsByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0);
  return DoRequestWithToken<StreamsByYear>(
    `/stats/artists-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    "GET",
    token
  );
}

export async function GetAlbumsByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0);
  return DoRequestWithToken<StreamsByYear>(
    `/stats/albums-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    "GET",
    token
  );
}

export async function GetTracksByYear(
  token: string,
  minSeconds?: number,
  excludeSkips?: boolean
) {
  const minMilliseconds = ((minSeconds ?? 30) * 1000).toFixed(0);
  return DoRequestWithToken<StreamsByYear>(
    `/stats/tracks-by-year?minimum_milliseconds=${minMilliseconds}&include_skipped=${!excludeSkips}`,
    "GET",
    token
  );
}

type UserHistoryStatusResponse = {
  user_has_history: boolean;
};

export async function GetUserHistoryStatus(token: string) {
  return DoRequestWithToken<UserHistoryStatusResponse>(
    `/user/has-spotify-history`,
    "GET",
    token
  );
}

type TrackStatsResponse = {
  track: Track;
  streams: MinEntryResponse[];
  rankings: MonthRanking[];
};

export type MonthRanking = {
  year: number;
  month: number;
  position: number;
};

export type TrackStats = {
  track: Track;
  streams: MinEntry[];
  rankings: MonthRanking[];
};

export async function GetTrackStats(token: string, uri: string) {
  const response = await DoRequestWithToken<TrackStatsResponse>(
    `/stats/track?spotify_uri=${uri}`,
    "GET",
    token
  );

  if ("error" in response) return response;
  const streamsWithTimestamps = response.streams.map((entry) => ({
    ...entry,
    timestamp: dayjs(entry.timestamp),
  }));
  return { ...response, streams: streamsWithTimestamps };
}
