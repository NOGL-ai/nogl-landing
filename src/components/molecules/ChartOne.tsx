"use client";

import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { name: "Sep", value: 23 },
  { name: "Oct", value: 11 },
  { name: "Nov", value: 22 },
  { name: "Dec", value: 27 },
  { name: "Jan", value: 53 },
  { name: "Feb", value: 62 },
  { name: "Mar", value: 37 },
  { name: "Apr", value: 41 },
  { name: "May", value: 54 },
  { name: "Jun", value: 72 },
  { name: "Jul", value: 63 },
  { name: "Aug", value: 85 },
];

const ChartOne: React.FC = () => {
  return (
    <div id="chartOne" className="-ml-5">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="chartOneGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635BFF" stopOpacity={0.3} />
              <stop offset="100%" stopColor="#635BFF" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="0 0" stroke="transparent" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12 }}
          />
          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{ fontSize: 0 }} />
          <Tooltip />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#635BFF"
            strokeWidth={2}
            fill="url(#chartOneGradient)"
            dot={false}
            activeDot={{ r: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartOne;
