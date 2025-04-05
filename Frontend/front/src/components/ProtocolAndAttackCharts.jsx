import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { Box, Typography, Paper } from "@mui/material";

const COLORS = ["#0A2647", "#144272", "#205295", "#2C74B3"];

const ProtocolAndAttackCharts = ({ logs }) => {
  const protocolCounts = {};
  const attackCounts = {};

  logs.forEach((log) => {
    const fields = log.text.split(",");
    const protocol = fields[2]?.toLowerCase(); // e.g., "tcp"
    const attackType = fields[0]; // last item

    if (protocol) {
      protocolCounts[protocol] = (protocolCounts[protocol] || 0) + 1;
    }

    if (attackType) {
      attackCounts[attackType] = (attackCounts[attackType] || 0) + 1;
    }
  });

  const attackData = Object.entries(attackCounts)
    .map(([name, count]) => ({ name: name || "Unknown", count }))
    .filter((d) => d.count > 0); // Remove empty values

  const protocolData = Object.entries(protocolCounts)
    .map(([name, value]) => ({ name: name.toUpperCase(), value }))
    .filter((d) => d.value > 0);

  return (
    <Box sx={{ display: "flex", gap: 4, flexWrap: "wrap", mt: 4 }}>
      <Paper sx={{ flex: 1, p: 2, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Attack Type Frequency
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart key={attackData.length} data={attackData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count">
              {attackData.map((entry, index) => (
                <Cell
                  key={`bar-cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Paper>

      <Paper sx={{ flex: 1, p: 2, borderRadius: 3 }}>
        <Typography variant="h6" gutterBottom>
          Protocol Usage (TCP/UDP/HTTP)
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart key={protocolData.length}>
            <Pie
              data={protocolData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {protocolData.map((entry, index) => (
                <Cell
                  key={`pie-cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </Paper>
    </Box>
  );
};

export default ProtocolAndAttackCharts;
