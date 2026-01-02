"use client";

import DashboardLayout from "@/components/layouts/layout-dashboard";
import { useGetEmployeeStatsQuery } from "@/store/api/employee-api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Briefcase, Loader2 } from "lucide-react";

export default function Page() {
  const { data: stats, isLoading } = useGetEmployeeStatsQuery();

  return (
    <DashboardLayout title="Dashboard">
      <div className="bg-gray-500 dark:bg-sidebar text-white rounded-lg p-8 border">
        <h1 className="text-xl font-bold mb-2">Selamat Datang Kembali</h1>
        <p className="text-sm">
          Senang melihat Anda kembali. Jelajahi dashboard Anda dan kelola data dengan efisien.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Total Karyawan</CardTitle>
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div>
                <p className="text-4xl font-bold">{stats?.totalEmployees || 0}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Total karyawan terdaftar
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Posisi Tersedia</CardTitle>
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Briefcase className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                <span className="text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div>
                <p className="text-4xl font-bold">{stats?.positions.length || 0}</p>
                <p className="text-sm text-muted-foreground mt-2 mb-3">
                  Posisi unik dalam sistem
                </p>
                {stats?.positions && stats.positions.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {stats.positions.slice(0, 5).map((position, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full"
                      >
                        {position}
                      </span>
                    ))}
                    {stats.positions.length > 5 && (
                      <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full">
                        +{stats.positions.length - 5} lainnya
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
