import { MusicNote } from "@mui/icons-material";
import { Box, Card } from "@mui/material";
import { useMemo } from "react";
import { Track } from "spotify-types";
import { QSTrack } from "../state/room";
import { Link } from "react-router-dom";

export interface SongProps {
  song?: QSTrack | Track;
  rightComponent?: JSX.Element;
  imageSize?: number;
  cardVariant?: "elevation" | "outlined";
  link?: boolean;
}

export function Song(props: SongProps) {
  const { rightComponent, imageSize, cardVariant, link } = props;
  const song: QSTrack | undefined = useMemo(() => {
    const s = props.song;
    if (!s) return undefined;
    if (!("external_ids" in s)) return s;
    const lastImage = s.album.images[s.album.images.length - 1];
    return {
      ...s,
      image: lastImage
        ? {
            url: lastImage.url,
            height: lastImage.height ?? 32,
            width: lastImage.width ?? 32,
          }
        : undefined,
      artists: s.artists.map((a) => a.name),
    };
  }, [props]);

  return (
    <Card sx={{ p: 0, mb: 1 }} variant={cardVariant}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {song?.image ? (
          <img
            src={song.image.url}
            alt={song?.name ?? "empty"}
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
          />
        ) : (
          <Box
            width={64}
            height={64}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ backgroundColor: "grey" }}
          >
            <MusicNote fontSize="large" />
          </Box>
        )}
        <Box
          paddingLeft={1}
          flex={1}
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {link ? (
            <Link
              to={`/stats/track/${song?.uri}`}
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: "bold",
              }}
            >
              {song?.name}
            </Link>
          ) : (
            <div
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                fontWeight: "bold",
              }}
            >
              {song?.name}
            </div>
          )}
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {song?.artists?.join(", ")}
          </div>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  );
}
