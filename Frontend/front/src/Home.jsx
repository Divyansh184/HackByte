import React, { useEffect, useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
  Switch,
  Card,
  CardContent,
  Divider,
  Paper,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";
import LogoutIcon from "@mui/icons-material/Logout";
import LogActivityChart from "./components/LogActivityChart";
import ProtocolAndAttackCharts from "./components/ProtocolAndAttackCharts";
import { useNavigate } from "react-router-dom";

function Home() {
  const [isToggled, setIsToggled] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  const [safeLogs, setSafeLogs] = useState([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chartData, setChartData] = useState([]);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const generateMockLog = () => ({
    id: Date.now() + Math.random(),
    text: `${(Math.random() * 0.1).toFixed(3)},tcp,http,SF,${Math.floor(
      Math.random() * 2000
    )},0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,2,2,0,0.0,0.0,0.0,1.0,0.0,0.0,10,10,1.0,0.0,0.1,0.0,0.0,0.0,0.0,0.0`,
    status: "pending",
  });

  useEffect(() => {
    let interval;
    if (isToggled && liveLogs.length < 3) {
      interval = setInterval(() => {
        setLiveLogs((prev) => {
          if (prev.length < 3) {
            return [...prev, generateMockLog()];
          }
          return prev;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isToggled, liveLogs]);

  useEffect(() => {
    if (
      isToggled &&
      !isProcessing &&
      liveLogs.length > 0 &&
      liveLogs[0].status === "pending"
    ) {
      const currentLog = liveLogs[0];
      const isSafe = Math.random() > 0.5;
      const updatedLog = {
        ...currentLog,
        status: isSafe ? "safe" : "suspicious",
      };

      setIsProcessing(true);
      setLiveLogs((prev) => prev.map((log, i) => (i === 0 ? updatedLog : log)));

      setTimeout(() => {
        setLiveLogs((prev) => prev.slice(1));

        const timeLabel = new Date().toLocaleTimeString();
        setChartData((prev) => {
          const last = prev[prev.length - 1] || { safe: 0, suspicious: 0 };
          const newData = {
            time: timeLabel,
            safe: isSafe ? last.safe + 1 : last.safe,
            suspicious: isSafe ? last.suspicious : last.suspicious + 1,
          };
          return [...prev.slice(-9), newData];
        });

        if (isSafe) {
          setSafeLogs((prev) => [...prev, updatedLog].slice(-10));
        } else {
          setSuspiciousLogs((prev) => [...prev, updatedLog].slice(-10));
        }

        setIsProcessing(false);
      }, 1000);
    }
  }, [liveLogs, isToggled, isProcessing]);

  const getLogColor = (status) => {
    switch (status) {
      case "safe":
        return "#d4f4d7";
      case "suspicious":
        return "#fcdcdc";
      default:
        return "#f4f4f4";
    }
  };

  return (
    <>
      {/* NAVBAR */}
      <AppBar
        position="fixed"
        sx={{ backgroundColor: "#003366", zIndex: 1300 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt="Company Logo"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Seal_of_UIDAI.svg/2048px-Seal_of_UIDAI.svg.png"
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Network Shield
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" startIcon={<HistoryIcon />}>
              Report History
            </Button>
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
            <Typography variant="body1">Hello, User</Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* BODY */}
      <Box sx={{ p: 4, mt: 10 }}>
        {/* TOGGLE & REPORT */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
            flexWrap: "wrap",
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 2,
              borderRadius: 3,
              display: "flex",
              alignItems: "center",
              gap: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: "orange", mr: 1 }}
            >
              Start Network Log Analysis
            </Typography>
            <Switch
              checked={isToggled}
              onChange={() => {
                setLiveLogs([]);
                setIsToggled(!isToggled);
              }}
              color="primary"
            />
          </Paper>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: { xs: 2, sm: 0 } }}
            onClick={() => {
              const blob = new Blob(
                [suspiciousLogs.map((log) => log.text).join("\n")],
                { type: "text/plain;charset=utf-8" }
              );
              const link = document.createElement("a");
              link.href = URL.createObjectURL(blob);
              link.download = "suspicious_logs_report.txt";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
          >
            Generate Report
          </Button>
        </Box>

        {/* LIVE LOGS */}
        <Card
          sx={{
            width: "100%",
            mb: 4,
            p: 2,
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Live Log Analysis
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              minHeight: "75px",
              maxHeight: "75px",
              justifyContent: "center",
            }}
          >
            {liveLogs.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No logs currently being analyzed.
              </Typography>
            ) : (
              liveLogs.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    backgroundColor: getLogColor(log.status),
                    p: 1,
                    borderRadius: 2,
                    fontSize: "0.75rem",
                    fontFamily: "monospace",
                  }}
                >
                  {log.text}
                </Box>
              ))
            )}
          </Box>
        </Card>

        {/* SAFE & SUSPICIOUS LOGS */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
          <Card
            sx={{
              flex: 1,
              minWidth: "300px",
              maxHeight: "300px",
              minHeight: "300px",
              overflow: "hidden",
              borderRadius: 3,
              backgroundColor: "#e6ffe6",
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" color="green">
                Safe Logs
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {safeLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No safe logs.
                  </Typography>
                ) : (
                  safeLogs.map((log) => (
                    <Typography
                      key={log.id}
                      sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                    >
                      {log.text}
                    </Typography>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>

          <Card
            sx={{
              flex: 1,
              minWidth: "300px",
              maxHeight: "300px",
              minHeight: "300px",
              overflow: "hidden",
              borderRadius: 3,
              backgroundColor: "#ffe6e6",
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography variant="h6" color="red">
                Suspicious Logs
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {suspiciousLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No suspicious logs.
                  </Typography>
                ) : (
                  suspiciousLogs.map((log) => (
                    <Typography
                      key={log.id}
                      sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                    >
                      {log.text}
                    </Typography>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* CHART */}
        <Card
          sx={{
            width: "100%",
            mt: 4,
            p: 2,
            borderRadius: 3,
            backgroundColor: "#fff",
            boxShadow: 4,
          }}
        >
          <Typography variant="h6" sx={{ mb: 2 }}>
            Log Activity Over Time
          </Typography>
          <LogActivityChart data={chartData} />
        </Card>

        <ProtocolAndAttackCharts logs={[...safeLogs, ...suspiciousLogs]} />
      </Box>
    </>
  );
}

export default Home;
