import { MusicNote } from "@mui/icons-material";
import { Box, Card } from "@mui/material";
import { useMemo } from "react";
import { Artist, Image } from "spotify-types";

export interface ArtistProps {
  artist?: Artist;
  rightComponent?: JSX.Element;
  imageSize?: number;
  cardVariant?: "elevation" | "outlined";
}

export function ArtistDisplay(props: ArtistProps) {
  const { rightComponent, imageSize, cardVariant } = props;
  const artist: (Artist & { image?: Image }) | undefined = useMemo(() => {
    const s = props.artist;
    if (!s) return undefined;
    if (!("external_ids" in s)) return s;
    const lastImage = s.images[s.images.length - 1];
    return {
      ...s,
      image: lastImage
        ? {
            url: lastImage.url,
            height: lastImage.height ?? 32,
            width: lastImage.width ?? 32,
          }
        : undefined,
    };
  }, [props]);

  return (
    <Card sx={{ p: 0, mb: 1 }} variant={cardVariant}>
      <Box display="flex" alignItems="center" paddingRight={1}>
        {artist?.images[artist.images.length - 1] ? (
          <img
            src={artist.images[artist.images.length - 1].url}
            alt={artist?.name ?? "empty"}
            width={imageSize ?? 64}
            height={imageSize ?? 64}
            style={{ borderTopLeftRadius: 5, borderBottomLeftRadius: 5 }}
          />
        ) : (
          <Box
            width={48}
            height={48}
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
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              fontWeight: "bold",
            }}
          >
            {artist?.name}
          </div>
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "#FFF6",
            }}
          >
            Popularity: {artist?.popularity}
          </div>
        </Box>
        {rightComponent ?? <div />}
      </Box>
    </Card>
  );
}
