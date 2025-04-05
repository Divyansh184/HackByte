// LogActivityChart.js
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const LogActivityChart = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="time" />
        <YAxis allowDecimals={false} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="safe"
          stroke="#4caf50"
          strokeWidth={2}
          dot={false}
          name="Safe Logs"
        />
        <Line
          type="monotone"
          dataKey="suspicious"
          stroke="#f44336"
          strokeWidth={2}
          dot={false}
          name="Suspicious Logs"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default LogActivityChart;
