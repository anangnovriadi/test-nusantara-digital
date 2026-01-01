"use client";

import DashboardLayout from "@/components/layouts/layout-dashboard";
import { PieChartListRekap } from "@/components/pie-chart-rekap";
import { PieChartListGender } from "@/components/pie-chart-gender";
import { useGetAllAttendancesQuery, useGetAllAttendancesSummaryQuery } from "@/store/api/attendance-api";
import { useGetAllStudentGenderQuery } from "@/store/api/student-api";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Info, Loader2 } from "lucide-react";

export type Attendance = {
  id: string;
  name: string;
  HADIR: number;
  IJIN: number;
  SAKIT: number;
  TANPA_KETERANGAN: number;
};

export default function Page() {
  const { data: attendanceDataAll, isLoading: isLoadingAttendanceAll } = useGetAllAttendancesQuery({ attendance_date: '' });
  const { data: attendanceData, isLoading: isLoadingAttendance } = useGetAllAttendancesSummaryQuery({});
  const { data: studentGenderData, isLoading: isLoadingStudentGender } = useGetAllStudentGenderQuery({});
  const attendanceTotal = attendanceDataAll?.total;
  const attendances: Attendance[] = attendanceData?.data ?? [];
  const studentGenderRaw = studentGenderData?.data;
  
  const aggregatedData = attendances.reduce(
    (acc, curr) => {
      acc.HADIR += curr.HADIR;
      acc.IJIN += curr.IJIN;
      acc.SAKIT += curr.SAKIT;
      acc.TANPA_KETERANGAN += curr.TANPA_KETERANGAN;
      return acc;
    },
    { HADIR: 0, IJIN: 0, SAKIT: 0, TANPA_KETERANGAN: 0 }
  );

  const pieChartData = [
    { type: "HADIR", value: aggregatedData.HADIR, fill: "var(--chart-1)" },
    { type: "IJIN", value: aggregatedData.IJIN, fill: "var(--chart-2)" },
    { type: "SAKIT", value: aggregatedData.SAKIT, fill: "var(--chart-3)" },
    { type: "TANPA_KETERANGAN", value: aggregatedData.TANPA_KETERANGAN, fill: "var(--chart-4)" },
  ];

  const genderChartData = studentGenderRaw
    ? [
        { type: "man", gender: studentGenderRaw.man, fill: "var(--color-man)" },
        { type: "women", gender: studentGenderRaw.women, fill: "var(--color-women)" },
      ]
    : [];
  
  return (
    <DashboardLayout title="Dashboard">
      {isLoadingStudentGender ? (
        <div className="flex justify-center items-center gap-2 mt-2">
          <Loader2 className="animate-spin size-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Memuat data dashboard...</span>
        </div>
      ) : studentGenderRaw && studentGenderRaw.man === 0 && studentGenderRaw.women === 0 ? (
        <Alert variant="destructive">
          <Info />
          <AlertTitle>Lengkapi dan isi data siswa</AlertTitle>
        </Alert>
      ) : (
        <div className="flex flex-1 flex-col gap-4">
          <div className="grid auto-rows-min gap-4 md:grid-cols-2">
            <PieChartListGender
              data={genderChartData}
              title="Grafik Siswa Berdasarkan Jenis Kelamin"
            />
            <PieChartListRekap
              data={pieChartData}
              attendanceTotal={attendanceTotal ?? 0}
              title="Grafik Rekap Keseluruhan Presensi"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
