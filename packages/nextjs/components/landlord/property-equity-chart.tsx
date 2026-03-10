"use client"

import { Loader2 } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { useEquityDistribution } from "@/hooks/property/usePropertyEvents"
import { formatLandlordEquityChart } from "@/utils/formatter"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "../ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import LoadingSpinner from "../shared/loading-spinner"

export const description = "A linear line chart"

const chartConfig = {
  equity: {
    label: "Equity(%)",
    color: "#3b82f6",
  },
} satisfies ChartConfig

export function PropertyEquityChart() {
  const path = usePathname()
  const [year, setYear] = useState<number>(2025);
  const propertyId = path.split("/")[3]
  const {data: data, loading:equityLoading} = useEquityDistribution(+propertyId, year)


  const chartData = formatLandlordEquityChart(data)
  console.log(chartData)
  
  return (
        <div className="">
          <div className="flex justify-between items-center">
              <p className="text-slate-600 font-semibold text-2xl">Equity Timeline</p>

              <div className="flex items-center space-x-3">
                  <p className="text-gray-500">Yearly</p>
                  <div className="">
                    <Select value={String(year)} onValueChange={(val) => setYear(Number(val))}>
                        <SelectTrigger className="w-[280px]">
                            <SelectValue placeholder="Select a year"/>
                        </SelectTrigger>
                        <SelectContent>

                                <SelectItem value={`${new Date().getFullYear()}`}>This year</SelectItem>
                                <SelectItem value="2026">2026</SelectItem>
                                <SelectItem value="2027">2027</SelectItem>
                                <SelectItem value="2028">2028</SelectItem>
                                <SelectItem value="2029">2029</SelectItem>
                                <SelectItem value="2030">2030</SelectItem>
                        </SelectContent>
                    </Select>
                  </div>
              </div>
          </div>

          <div className="w-full h-[300px] rounded-lg border border-gray-300 mt-5">
            { equityLoading ?
              <div className="h-[300px] w-full flex items-center justify-center">
                    <LoadingSpinner loading={equityLoading} size={40}/>
              </div> :

              <ChartContainer config={chartConfig} className="h-[300px] w-full p-4">
                <LineChart
                  accessibilityLayer
                  data={chartData}
                  margin={{
                    left: 12,
                    right: 12,
                  }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="monthName"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Line
                    dataKey="equity"
                    type="linear"
                    stroke="var(--color-equity)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ChartContainer>
            }
          </div>

        </div>
  )
}
