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

  const generateMockLog = async () => {
    try {
      const response = await fetch("http://localhost:3001/log");
      const data = await response.json();
      return {
        id: Date.now(),
        text: data.log,
        status: "pending",
      };
    } catch (error) {
      console.error("Failed to fetch log:", error);
      return {
        id: Date.now(),
        text: "Error fetching log",
        status: "error",
      };
    }
  };

  useEffect(() => {
    let interval;
    if (isToggled && liveLogs.length < 3) {
      interval = setInterval(async () => {
        if (liveLogs.length < 3) {
          const newLog = await generateMockLog();
          setLiveLogs((prev) => [...prev, newLog]);
        }
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

      // 👇 Deterministic classification based on first letter
      const firstLetter = currentLog.text.trim()[0]?.toUpperCase();
      const isSafe = firstLetter === "N";

      const updatedLog = {
        ...currentLog,
        status: isSafe ? "safe" : "suspicious",
      };

      setIsProcessing(true);
      setLiveLogs((prev) =>
        prev.map((log, i) => (i === 0 ? updatedLog : log))
      );

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
          setSuspiciousLogs((prev) => [...prev, updatedLog]);
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
      <AppBar position="fixed" sx={{ backgroundColor: "#5D4037", zIndex: 1300 }}>
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt="Company Logo"
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Seal_of_UIDAI.svg/2048px-Seal_of_UIDAI.svg.png"
              sx={{ width: 40, height: 40, mr: 2 }}
            />
            <Typography variant="h6" sx={{ fontWeight: 600, fontFamily: "Roboto, sans-serif" }}>
              Network Shield
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button color="inherit" startIcon={<HistoryIcon />}>
              Report History
            </Button>
            <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
              Logout
            </Button>
            <Typography variant="body1" sx={{ fontFamily: "Roboto, sans-serif" }}>
              Hello, User
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* BODY */}
      <Box sx={{ p: 4, mt: 10, backgroundColor: "#F5EBDD", minHeight: "100vh" }}>
        {/* TOP SECTION: Left Control Card & Live Log Analysis */}
        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          {/* Left Control Card */}
          <Card
            elevation={3}
            sx={{
              border: "2px solid #5D4037",
              borderRadius: 3,
              p: 3,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: "200px",
              height: "200px",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                textAlign: "center",
                fontWeight: 600,
                mb: 2,
                fontFamily: "Roboto, sans-serif",
                color: "#A1887F",
              }}
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
          </Card>

          {/* Live Log Analysis Card with Generate Report Button on the Right */}
          <Card
            sx={{
              flex: 1,
              minWidth: "300px",
              border: "2px solid #5D4037",
              borderRadius: 3,
              backgroundColor: "#fff",
              boxShadow: 4,
              p: 3,
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Roboto, sans-serif",
                  color: "#5D4037",
                  fontWeight: 600,
                }}
              >
                Live Log Analysis
              </Typography>
              <Button
                variant="contained"
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
                sx={{
                  height: "40px",
                  fontSize: "0.9rem",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 600,
                  borderRadius: "8px",
                  textTransform: "none",
                  backgroundColor: "#5D4037",
                  "&:hover": { backgroundColor: "#4E342E" },
                }}
              >
                Generate Report
              </Button>
            </Box>
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
                <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Roboto, sans-serif" }}>
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
        </Box>

        {/* SAFE & SUSPICIOUS LOGS */}
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 4 }}>
          <Card
            sx={{
              flex: 1,
              minWidth: "300px",
              maxHeight: "300px",
              minHeight: "300px",
              overflow: "auto",
              borderRadius: 3,
              backgroundColor: "#e6ffe6",
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: "green",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 600,
                }}
              >
                Safe Logs
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {safeLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Roboto, sans-serif" }}>
                    No safe logs.
                  </Typography>
                ) : (
                  safeLogs.map((log) => (
                    <Typography key={log.id} sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                      {log.text.slice(3)}
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
              overflow: "auto",
              borderRadius: 3,
              backgroundColor: "#ffe6e6",
              boxShadow: 2,
            }}
          >
            <CardContent>
              <Typography
                variant="h6"
                sx={{
                  color: "red",
                  fontFamily: "Roboto, sans-serif",
                  fontWeight: 600,
                }}
              >
                Suspicious Logs
              </Typography>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                {suspiciousLogs.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ fontFamily: "Roboto, sans-serif" }}>
                    No suspicious logs.
                  </Typography>
                ) : (
                  suspiciousLogs.map((log) => (
                    <Typography key={log.id} sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}>
                      {log.text.slice(3)}
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
          <Typography
            variant="h6"
            sx={{
              mb: 2,
              fontFamily: "Roboto, sans-serif",
              color: "#5D4037",
              fontWeight: 600,
            }}
          >
            Log Activity Over Time
          </Typography>
          <LogActivityChart data={chartData} />
        </Card>

        {/* ADDITIONAL CHARTS */}
        <ProtocolAndAttackCharts logs={[...safeLogs, ...suspiciousLogs]} />
      </Box>
    </>
  );
}

export default Home;
