"use client";

import * as React from "react"
import { useEffect, useState } from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import { useGetAllAttendancesSummaryQuery } from "@/store/api/attendance-api";
import { useGetDetailSettingQuery } from "@/store/api/setting-api";
import { exportAttendanceToPDF } from "@/lib/export-pdf";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useGetAllHolidaysQuery } from "@/store/api/holiday-api";

export type Attendance = {
  id: string;
  name: string;
  nisn: string;
  attendance_date: string[];
  attendance_detail: any[];
  HADIR: number;
  IJIN: number;
  SAKIT: number;
  TANPA_KETERANGAN: number;
}

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(`${new Date().getMonth() + 1}`);
  const [selectedYear, setSelectedYear] = useState<string>(`${new Date().getFullYear()}`);
  const [dateRange, setDateRange] = useState<{ start_date: string, end_date: string } | null>(null);

  const { data: holidaysData, isLoading: isLoadingHolidaysData } = useGetAllHolidaysQuery({});
  const { data: attendanceData, isLoading, isError, refetch } = useGetAllAttendancesSummaryQuery({});
  const {
    data: exportAttendanceData,
    isFetching: isExportLoading,
    refetch: refetchExportData,
  } = useGetAllAttendancesSummaryQuery(dateRange!, {
    skip: !dateRange,
  });
  const { data: settingData, isLoading: isSettingLoading } = useGetDetailSettingQuery({});
  const data: Attendance[] = attendanceData?.data ?? [];

  const schoolName = settingData?.data?.school_name ?? "Nama Sekolah";
  const teacherName = settingData?.data?.fullname ?? "Nama Guru";
  const NIP = settingData?.data?.nip ?? "NIP Guru";
  const principalName = settingData?.data?.principal_name ?? "Nama Kepala Sekolah";
  const principalNIP = settingData?.data?.principal_nip ?? "NIP Kepala Sekolah";
  const schoolYear = settingData?.data?.school_year ?? "Tahun Ajaran";
  const levelOfEducation = settingData?.data?.level_of_education ?? "Tingkat Pendidikan";
  const address = settingData?.data?.address ?? "Alamat";

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const filteredMonths = parseInt(selectedYear, 10) === currentYear
    ? months.filter((m) => m.value <= currentMonth)
    : months;

  useEffect(() => {
    refetch();
  }, []);

  const getDateRange = (month: number, year: number) => {
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    return {
      start_date: start.toISOString().split('T')[0],
      end_date: end.toISOString().split('T')[0],
    };
  }

  const columns: ColumnDef<Attendance>[] = [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ table, row }) => {
        const rows = table.getPaginationRowModel().rows
        const indexOnPage = rows.findIndex(r => r.id === row.id)
        const pageIndex = table.getState().pagination.pageIndex
        const pageSize = table.getState().pagination.pageSize
        const globalIndex = pageIndex * pageSize + indexOnPage + 1

        return <div className="text-center">{globalIndex}</div>
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <a
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Nama Siswa
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => (
        <div className="py-2">{row.original.name}</div>
      ),
    },
    {
      accessorKey: "HADIR",
      header: ({ column }) => (
        <a
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Total Hadir
        </a>
      ),
      cell: ({ row }) => (
        <div>{row.original.HADIR}</div>
      ),
    },
    {
      accessorKey: "IJIN",
      header: ({ column }) => (
        <a
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Total Ijin
        </a>
      ),
      cell: ({ row }) => (
        <div>{row.original.IJIN}</div>
      ),
    },
    {
      accessorKey: "SAKIT",
      header: ({ column }) => (
        <a
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Total Sakit
        </a>
      ),
      cell: ({ row }) => (
        <div>{row.original.SAKIT}</div>
      ),
    },
    {
      accessorKey: "TANPA_KETERANGAN",
      header: ({ column }) => (
        <a
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Total Tanpa Ket.
        </a>
      ),
      cell: ({ row }) => (
        <div>{row.original.TANPA_KETERANGAN}</div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: 5,
      },
    },
  });

  const handleExport = async () => {
    setIsExporting(true);

    const { start_date, end_date } = getDateRange(
      parseInt(selectedMonth),
      parseInt(selectedYear)
    );

    setDateRange({ start_date, end_date });
  };

  useEffect(() => {
    if (!dateRange || !exportAttendanceData) return;

    const doExport = async () => {
      const formattedHolidays = holidaysData?.data?.map((holiday: any) => ({
        date: new Date(holiday.date),
        note: holiday.note,
      })) ?? [];

      exportAttendanceToPDF(exportAttendanceData.data ?? [], {
        schoolName,
        teacherName,
        NIP,
        principalName,
        principalNIP,
        schoolYear,
        levelOfEducation,
        address,
        month: parseInt(selectedMonth, 10),
        year: parseInt(selectedYear, 10),
        holidays: formattedHolidays,
      });

      setIsExporting(false);
      setIsDialogOpen(false);
      setDateRange(null);
    };

    doExport();
  }, [exportAttendanceData]);

  return (
    <DashboardLayout title="Rekap Presensi">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow px-4 overflow-x-auto">
        <div className="w-full">
          <div className="md:flex justify-between items-center py-4">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full md:w-48 text-center md:text-left placeholder:text-center md:placeholder:text-left"
            />
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <form>
                <DialogTrigger asChild>
                  <Button className="cursor-pointer w-full mt-2.5 md:mt-0">Export</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Export Rekap Presensi</DialogTitle>
                    <DialogDescription>
                      Silakan pilih tahun dan bulan
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Bulan" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredMonths.map((month) => (
                            <SelectItem key={month.value} value={`${month.value}`}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-3">
                      <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Pilih Tahun" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 11 }, (_, i) => `${new Date().getFullYear() - 5 + i}`).map((year) => (
                            <SelectItem key={year} value={year}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className="cursor-pointer" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button
                      className="cursor-pointer"
                      onClick={handleExport}
                      disabled={isSettingLoading || isExporting}
                    >
                      {isExporting ? <Loader2 className="animate-spin size-5" /> : 'Export'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </form>
            </Dialog>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header, index, headers) => {
                      const isFirst = index === 0;
                      const isLast = index === headers.length - 1;
    
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "bg-secondary text-secondary-foreground",
                            isFirst && "rounded-tl-md",
                            isLast && "rounded-tr-md"
                          )}
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="animate-spin size-5 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Memuat data rekap presensi...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                      Tidak ada data ditemukan
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground py-2">
            {table.getRowModel().rows.length > 0 && (
              <>
                Showing{" "}
                <span className="font-medium">
                  {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    attendanceData?.data?.length ?? 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{attendanceData?.data?.length ?? 0}</span> entries
              </>
            )}
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <div className="space-x-2">
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                className="cursor-pointer"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
