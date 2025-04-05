import React, { useState } from "react";
import { Paper, Button, Typography, Box } from "@mui/material";
import SecurityIcon from "@mui/icons-material/Security";

const FetchLogsComponent = () => {
  const [status, setStatus] = useState("");
  const [logs, setLogs] = useState(null);

  const handleFetchLogs = async () => {
    setStatus("Fetching logs securely...");
    try {
      // Replace with your real endpoint
      const response = await fetch("/api/fetch-logs");
      const data = await response.json();
      setLogs(data.logs);
      setStatus("Logs fetched successfully.");
    } catch (error) {
      console.error(error);
      setStatus("Error fetching logs.");
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <SecurityIcon sx={{ mr: 1 }} />
        <Typography variant="h5">Network Log Analysis</Typography>
      </Box>
      <Button variant="contained" color="primary" onClick={handleFetchLogs}>
        Fetch Logs
      </Button>
      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        {status}
      </Typography>
      {logs && (
        <Box
          sx={{ mt: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}
        >
          <Typography variant="h6" gutterBottom>
            Fetched Logs:
          </Typography>
          <pre style={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
            {logs}
          </pre>
        </Box>
      )}
    </Paper>
  );
};

export default FetchLogsComponent;
