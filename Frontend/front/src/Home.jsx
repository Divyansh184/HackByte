import React, { useEffect, useState, useRef } from "react";
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
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function Home() {
  const [isToggled, setIsToggled] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  const [safeLogs, setSafeLogs] = useState([]);
  const [suspiciousLogs, setSuspiciousLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chartData, setChartData] = useState([]);
  const [isSuspiciousSimulationRunning, setIsSuspiciousSimulationRunning] =
    useState(false);

  const navigate = useNavigate();
  // Refs for timeout IDs and for capturing DOM elements in PDF
  const suspiciousTimeouts = useRef([]);
  const suspiciousLogsRef = useRef(null); // Suspicious logs will be captured
  const logActivityRef = useRef(null);
  const protocolChartsRef = useRef(null);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Generate a mock log from the backend
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

  // Function to simulate hardcoded suspicious logs
  const loadHardcodedSuspiciousLogs = () => {
    if (isSuspiciousSimulationRunning) {
      // Stop simulation: clear timeouts and live logs.
      suspiciousTimeouts.current.forEach((timeoutId) =>
        clearTimeout(timeoutId)
      );
      suspiciousTimeouts.current = [];
      setLiveLogs([]);
      setIsSuspiciousSimulationRunning(false);
      return;
    }

    setIsSuspiciousSimulationRunning(true);
    const hardcodedLogs = [
      {
        id: 101,
        text: "0,icmp,ecr_i,SF,1032,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,316,316,0.00,0.00,0.00,0",
        status: "suspicious",
      },
      {
        id: 102,
        text: "25,tcp,telnet,SF,269,2333,0,0,0,0,0,1,0,1,0,2,2,1,0,0,0,0,1,1,0.00,0.00,0.00,0",
        status: "suspicious",
      },
      {
        id: 103,
        text: "0,icmp,ecr_i,SF,1032,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,511,511,0.00,0.00,0.00",
        status: "suspicious",
      },
      {
        id: 104,
        text: "0,udp,private,SF,28,0,0,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,13,13,0.00,0.00,0.00,0.00",
        status: "suspicious",
      },
      {
        id: 105,
        text: "0,tcp,telnet,RSTO,126,179,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,1,1,0.00,0.00,1.00,1",
        status: "suspicious",
      },
      {
        id: 106,
        text: "1,tcp,rje,RSTR,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,128,2,0.00,0.00,1.00,1.00,0.02,0",
        status: "suspicious",
      },
      {
        id: 107,
        text: "134,tcp,login,SF,100,39445,0,0,2,0,0,1,1,0,0,1,0,0,1,0,0,0,1,1,0.00,0.00,0.00",
        status: "suspicious",
      },
      {
        id: 108,
        text: "0,icmp,ecr_i,SF,1032,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,511,511,0.00,0.00,0.00,0",
        status: "suspicious",
      },
      {
        id: 109,
        text: "0,tcp,private,S0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,282,17,1.00,1.00,0.00,",
        status: "suspicious",
      },
      {
        id: 110,
        text: "0,icmp,ecr_i,SF,1032,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,511,511,0.00,0.00,0.00",
        status: "suspicious",
      },
      {
        id: 111,
        text: "0,icmp,ecr_i,SF,520,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,503,503,0.00,0.00,0.00,0.",
        status: "suspicious",
      },
      {
        id: 112,
        text: "0,tcp,private,REJ,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,117,3,0.00,0.00,1.00,1.00,0.0",
        status: "suspicious",
      },
    ];

    hardcodedLogs.forEach((log, index) => {
      const t1 = setTimeout(() => {
        setLiveLogs((prev) => [...prev, log]);
        const t2 = setTimeout(() => {
          setLiveLogs((prev) => prev.filter((l) => l.id !== log.id));
          processLog(log);
        }, 1000);
        suspiciousTimeouts.current.push(t2);
      }, index * 1500);
      suspiciousTimeouts.current.push(t1);
    });
  };

  // Process a log: classify it as safe or suspicious
  const processLog = (logToProcess) => {
    // Determine if the log is safe based on its text's first letter.
    const firstLetter = logToProcess.text.trim()[0]?.toUpperCase();
    const isSafe = firstLetter === "N";
    const updatedLog = {
      ...logToProcess,
      status: isSafe ? "safe" : "suspicious",
    };

    setIsProcessing(true);

    if (isSafe) {
      setSafeLogs((prevSafe) => {
        const newSafe = [...prevSafe, updatedLog].slice(-10);
        updateChartData(newSafe.length, suspiciousLogs.length);
        return newSafe;
      });
    } else {
      setSuspiciousLogs((prevSuspicious) => {
        const newSuspicious = [...prevSuspicious, updatedLog];
        updateChartData(safeLogs.length, newSuspicious.length);
        return newSuspicious;
      });
    }
    setIsProcessing(false);
  };

  // Update the chart with current cumulative counts
  const updateChartData = (safeCount, suspiciousCount) => {
    const timeLabel = new Date().toLocaleTimeString();
    setChartData((prev) => [
      ...prev.slice(-9),
      { time: timeLabel, safe: safeCount, suspicious: suspiciousCount },
    ]);
  };

  // Generate live logs if simulation is toggled on
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

  // Process the first pending log from liveLogs queue (if any)
  useEffect(() => {
    if (
      isToggled &&
      !isProcessing &&
      liveLogs.length > 0 &&
      liveLogs[0].status === "pending"
    ) {
      const currentLog = liveLogs[0];
      setLiveLogs((prev) => prev.slice(1));
      processLog(currentLog);
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

  // Generate the PDF report which includes suspicious logs and the three graphs
  const handleGenerateReport = async () => {
    const pdf = new jsPDF("p", "mm", "a4");
    let yPosition = 10;

    // Title
    pdf.setFontSize(16);
    pdf.text("Suspicious Network Logs Report", 10, yPosition);
    yPosition += 10;

    // Capture Suspicious Logs
    if (suspiciousLogsRef.current) {
      const logsCanvas = await html2canvas(suspiciousLogsRef.current, {
        scale: 2,
      });
      const logsImgData = logsCanvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(logsImgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.text("Suspicious Logs:", 10, yPosition);
      yPosition += 5;
      pdf.addImage(logsImgData, "PNG", 10, yPosition, pdfWidth, pdfHeight);
      yPosition += pdfHeight + 10;
    }

    // Capture Log Activity Chart
    if (logActivityRef.current) {
      const chartCanvas = await html2canvas(logActivityRef.current, {
        scale: 2,
      });
      const chartImgData = chartCanvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(chartImgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.text("Log Activity Over Time:", 10, yPosition);
      yPosition += 5;
      pdf.addImage(chartImgData, "PNG", 10, yPosition, pdfWidth, pdfHeight);
      yPosition += pdfHeight + 10;
    }

    // Capture Protocol and Attack Charts
    if (protocolChartsRef.current) {
      const protocolCanvas = await html2canvas(protocolChartsRef.current, {
        scale: 2,
      });
      const protocolImgData = protocolCanvas.toDataURL("image/png");
      const imgProps = pdf.getImageProperties(protocolImgData);
      const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.text("Protocol & Attack Charts:", 10, yPosition);
      yPosition += 5;
      pdf.addImage(protocolImgData, "PNG", 10, yPosition, pdfWidth, pdfHeight);
      yPosition += pdfHeight + 10;
    }

    pdf.save("suspicious_logs_report.pdf");
  };

  return (
    <>
      {/* NAVBAR */}
      <AppBar
        position="fixed"
        sx={{ backgroundColor: "#5D4037", zIndex: 1300 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Avatar
              alt="Company Logo"
              src="/em11.jpg"
              sx={{ width: 50, height: 50, mr: 2 }}
            />
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, fontFamily: "Roboto, sans-serif" }}
            >
              GoI Server
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
            <Typography
              variant="body1"
              sx={{ fontFamily: "Roboto, sans-serif" }}
            >
              Hello, User
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* BODY */}
      <Box sx={{ p: 4, mt: 5, backgroundColor: "#F5EBDD", minHeight: "100vh" }}>
        {/* TOP SECTION: Control Card & Live Log Analysis */}
        <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
          {/* Control Card */}
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

          {/* Live Log Analysis Card */}
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
              <Box sx={{ display: "flex", gap: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleGenerateReport}
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
                <Button
                  variant="contained"
                  onClick={loadHardcodedSuspiciousLogs}
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
                  Suspicious Logs
                </Button>
              </Box>
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
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontFamily: "Roboto, sans-serif" }}
                >
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: "Roboto, sans-serif" }}
                  >
                    No safe logs.
                  </Typography>
                ) : (
                  safeLogs.map((log) => (
                    <Typography
                      key={log.id}
                      sx={{ fontSize: "0.75rem", fontFamily: "monospace" }}
                    >
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
            <CardContent ref={suspiciousLogsRef}>
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
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: "Roboto, sans-serif" }}
                  >
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

        {/* CHART: Log Activity Over Time */}
        <Card
          ref={logActivityRef}
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

        {/* ADDITIONAL CHARTS: Protocol & Attack Charts */}
        <Box ref={protocolChartsRef} sx={{ mt: 4 }}>
          <ProtocolAndAttackCharts logs={[...safeLogs, ...suspiciousLogs]} />
        </Box>
      </Box>
    </>
  );
}

export default Home;
