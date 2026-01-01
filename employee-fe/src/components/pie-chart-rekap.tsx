"use client"

import { Pie, PieChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type PieChartListProps = {
  data: {
    type: string
    value: number
    fill: string
  }[]
  attendanceTotal: number
  title?: string
}

const chartConfig = {
  HADIR: {
    label: "Hadir",
    color: "var(--chart-a)",
  },
  IJIN: {
    label: "Izin",
    color: "var(--chart-2)",
  },
  SAKIT: {
    label: "Sakit",
    color: "var(--chart-3)",
  },
  TANPA_KETERANGAN: {
    label: "Tanpa Ket.",
    color: "var(--chart-4)",
  },
} satisfies ChartConfig

export function PieChartListRekap({ data, attendanceTotal, title }: PieChartListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {attendanceTotal && attendanceTotal > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[260px]"
          >
            <PieChart>
              <ChartTooltip
                content={<ChartTooltipContent nameKey="type" hideLabel />}
              />
              <Pie data={data} dataKey="value" />
              <ChartLegend
                content={<ChartLegendContent nameKey="type" />}
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex justify-center">
            <Badge
              variant="outline"
              className="bg-red-500 text-white whitespace-normal break-words max-w-full"
            >
              Tidak ada data ditemukan
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
