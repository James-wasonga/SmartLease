"use client";

import React, { PureComponent } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Data for 12 months (Jan to Dec)
const data = [
  { name: "Jan", actualGrowth: 200, projectedGrowth: 200, marketValue: 55000 },
  { name: "Feb", actualGrowth: 210, projectedGrowth: 210, marketValue: 58000 },
  { name: "Mar", actualGrowth: 220, projectedGrowth: 220, marketValue: 61000 },
  { name: "Apr", actualGrowth: 230, projectedGrowth: 230, marketValue: 64000 },
  { name: "May", actualGrowth: 240, projectedGrowth: 240, marketValue: 67000 },
  { name: "Jun", actualGrowth: 250, projectedGrowth: 250, marketValue: 70000 },
  { name: "Jul", actualGrowth: null, projectedGrowth: 260, marketValue: 73000 }, // Actual Growth stops at Jun
  { name: "Aug", actualGrowth: null, projectedGrowth: 270, marketValue: 76000 },
  { name: "Sep", actualGrowth: null, projectedGrowth: 280, marketValue: 79000 },
  { name: "Oct", actualGrowth: null, projectedGrowth: 290, marketValue: 82000 },
  { name: "Nov", actualGrowth: null, projectedGrowth: 305, marketValue: 88000 },
  { name: "Dec", actualGrowth: null, projectedGrowth: 320, marketValue: 95000 },
];

export default class ChartDemo extends PureComponent {
  static demoUrl =
    "https://codesandbox.io/p/sandbox/line-chart-width-xaxis-padding-8v7952";

  render() {
    return (
      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{
            top: 20,
            right: 50,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis
            yAxisId="left"
            label={{ value: "Tokens", angle: -90, position: "insideLeft" }}
            domain={[180, 320]}
            ticks={[180, 200, 220, 240, 260, 280, 300, 320]}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{
              value: "Market Value ($)",
              angle: 90,
              position: "insideRight",
              offset: -20,
            }}
            domain={[50000, 95000]}
            ticks={[
              50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000,
              95000,
            ]}
          />
          <Tooltip />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="actualGrowth"
            stroke="#82ca9d"
            name="Actual Growth"
            dot={true}
          />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="projectedGrowth"
            stroke="#00C4B4"
            strokeDasharray="5 5"
            name="Projected Growth"
            dot={true}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="marketValue"
            stroke="#8884d8"
            name="Market Value"
            dot={true}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }
}
