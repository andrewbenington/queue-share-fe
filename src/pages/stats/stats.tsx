import {
  ArrowBackIosNew,
  FormatListNumbered,
  TableChart,
  Timeline,
} from "@mui/icons-material";
import { List, ListItemButton, Paper, Stack } from "@mui/material";
import { useState } from "react";
import { Route, Routes } from "react-router-dom";
import SidebarLink from "../../components/sidebar_link";
import SongStatsPage from "./songs";
import SongRankingsPage from "./songs-by-month";
import YearlyTreeGraphPage from "./stats-albums";
import ArtistRankingsPage from "./artist-rankings";
import TrackDetails from "./track_details";

export default function StatsPage() {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <Stack direction="row" width="100%" spacing={0}>
      <Paper style={{ borderRadius: 0 }}>
        <List
          style={{
            display: "flex",
            flexDirection: "column",
            transition: "width 0.25s",
            width: "fit-content",
            minWidth: 0,
            height: "100%",
          }}
        >
          <SidebarLink
            path="year-tree"
            label="Yearly Tree Graph"
            icon={<TableChart />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="songs-by-year"
            label="Song/Artist Over Time"
            icon={<Timeline />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="songs-by-month"
            label="Songs By Month"
            icon={<FormatListNumbered />}
            collapsed={collapsed}
          />
          <SidebarLink
            path="artists-by-month"
            label="Artists By Month"
            icon={<FormatListNumbered />}
            collapsed={collapsed}
          />
          <div style={{ flex: 1 }} />
          <ListItemButton
            disableRipple
            onClick={() => setCollapsed(!collapsed)}
            style={{ height: "fit-content", flex: 0, marginBottom: 16 }}
          >
            <ArrowBackIosNew
              style={{
                rotate: collapsed ? "180deg" : "0deg",
                transition: "rotate 0.4s",
                marginLeft: "auto",
              }}
            />
          </ListItemButton>
        </List>
      </Paper>
      <Routes>
        <Route path="/year-tree" element={<YearlyTreeGraphPage />} />
        <Route path="/songs-by-year" element={<SongStatsPage />} />
        <Route path="/songs-by-month" element={<SongRankingsPage />} />
        <Route path="/artists-by-month" element={<ArtistRankingsPage />} />
        <Route path="/track/:spotify_uri" element={<TrackDetails />} />
      </Routes>
    </Stack>
  );
}
