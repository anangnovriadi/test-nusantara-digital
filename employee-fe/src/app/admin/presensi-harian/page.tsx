"use client";

import * as React from "react"
import { useState } from "react"
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import { useGetAllAttendancesQuery } from "@/store/api/attendance-api";
import { Badge } from "@/components/ui/badge";

export type Attendance = {
  id: string;
  email: string;
  status: "HADIR" | "SAKIT" | "IJIN" | "TANPA KETERANGAN";
  student: {
    name: string;
    gender: string;
  }
}

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("");

  const today = new Date();
  const currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const { data: attendanceData, isLoading, isError, refetch } = useGetAllAttendancesQuery({
    attendance_date: currentDate
  });
  const data: Attendance[] = attendanceData?.data ?? [];

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
      accessorKey: "student.name",
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
        <div className="py-2">{row.original.student.name}</div>
      ),
    },
    {
      accessorKey: "student.gender",
      header: ({ column }) => (
        <a
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Jenis Kelamin
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => (
        <div className="py-2">{row.original.student.gender}</div>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <a
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium text-muted-foreground dark:text-white"
        >
          Status
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => {
        const status = row.getValue("status") as string;

        const statusColorMap: Record<string, string> = {
          HADIR: "bg-yellow-500",
          SAKIT: "bg-blue-500",
          IJIN: "bg-emerald-500",
          "TANPA KETERANGAN": "bg-red-500",
        };

        return (
          <Badge className={statusColorMap[status] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"}>
            {status}
          </Badge>
        );
      },
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
  })

  return (
    <DashboardLayout title="Presensi Hari Ini">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow px-4 overflow-x-auto">
        <div className="w-full">
          <div className="md:flex justify-between items-center py-4">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full md:w-48 text-center md:text-left placeholder:text-center md:placeholder:text-left"
            />
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
                        <span className="text-sm text-muted-foreground">Memuat data presensi harian...</span>
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
