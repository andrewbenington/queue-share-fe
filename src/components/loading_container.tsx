import { Box, CircularProgress } from "@mui/material";

interface LoadingContainerProps extends React.PropsWithChildren {
  loading?: boolean;
  overlay?: boolean;
}

export default function LoadingContainer(props: LoadingContainerProps) {
  const { loading, overlay, children } = props;
  return (
    <Box style={{ position: "relative" }}>
      <div style={{ visibility: loading && !overlay ? "collapse" : "visible" }}>
        {children}
      </div>
      {loading && (
        <Box
          position="absolute"
          display="grid"
          alignItems="center"
          justifyContent="center"
          width="100%"
          height="100%"
          top={0}
          bottom={0}
          color="white"
        >
          <CircularProgress color="inherit" />
        </Box>
      )}
    </Box>
  );
}
