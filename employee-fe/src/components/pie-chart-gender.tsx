"use client"

import { Pie, PieChart } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";

const chartConfig = {
  gender: {
    label: "gender",
  },
  man: {
    label: "Laki-laki",
    color: "var(--chart-1)",
  },
  women: {
    label: "Perempuan",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

type PieChartListProps = {
  data: {
    type: string
    gender: number
    fill: string
  }[]
  title?: string
}

export function PieChartListGender({ data, title }: PieChartListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-center text-sm">
          {title ?? "Jumlah Siswa Berdasarkan Jenis Kelamin"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[260px]"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="type" hideLabel />}
            />
            <Pie data={data} dataKey="gender" />
            <ChartLegend
              content={<ChartLegendContent nameKey="type" />}
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
