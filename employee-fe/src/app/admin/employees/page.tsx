"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { ArrowUpDown, Edit, Trash2, Eye, Loader2, Upload, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import FormEmployee from "@/components/form-employee";
import {
  Employee,
  CreateEmployeeRequest,
  useGetAllEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
  useImportEmployeesMutation,
} from "@/store/api/employee-api";
import { toast } from "sonner";
import { useImportProgress } from "@/hooks/use-import-progress";
import { Progress } from "@/components/ui/progress";

const convertToRupiah = (num: number | string) => {
  // Convert to number if string
  const value = typeof num === 'string' ? parseFloat(num) : num;

  // Handle NaN, null, undefined, or invalid values
  if (value == null || isNaN(value)) {
    return "Rp.0,00";
  }

  return "Rp." + value
    .toFixed(2)
    .replace(/\d(?=(\d{3})+\.)/g, "$&.")
    .replace(".", ",");
};

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [editingRow, setEditingRow] = useState<Employee | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const { data: employeeData, isLoading, refetch } = useGetAllEmployeesQuery({});
  const [createEmployee] = useCreateEmployeeMutation();
  const [updateEmployee] = useUpdateEmployeeMutation();
  const [deleteEmployee, { isLoading: isDeleting }] = useDeleteEmployeeMutation();
  const [importEmployees, { isLoading: isImporting }] = useImportEmployeesMutation();

  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(5);

  const [importJobId, setImportJobId] = useState<string | null>(null);
  const { progress, isCompleted, error: importError } = useImportProgress(importJobId);

  useEffect(() => {
    refetch();
  }, []);

  // Reset import state when import is completed
  useEffect(() => {
    if (isCompleted && importJobId) {
      console.log('[Page] ✅ Import completed, showing success message');
      refetch(); // Refetch data (async)
      toast.success("Import CSV berhasil! Sedang memuat data terbaru...");

      // Reset state after a short delay
      setTimeout(() => {
        setImportJobId(null);
      }, 2000);
    }
  }, [isCompleted, importJobId]);

  // Handle import errors
  useEffect(() => {
    if (importError && importJobId) {
      console.log('[Page] ❌ Import error:', importError);
      toast.error(`Import gagal: ${importError}`);

      // Reset state after showing error
      setTimeout(() => {
        setImportJobId(null);
      }, 3000);
    }
  }, [importError, importJobId]);

  const handleEdit = (row: Employee) => {
    setEditMode("edit");
    setEditingRow({ ...row });
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditMode("add");
    setEditingRow(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id).unwrap();
      toast.success("Data karyawan berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingRowId(null);
      refetch();
    } catch {
      toast.error("Gagal menghapus data / sesi telah berakhir");
      setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: CreateEmployeeRequest) => {
    try {
      if (editMode === "add") {
        await createEmployee(data).unwrap();
        toast.success("Data karyawan berhasil ditambahkan");
      } else if (editMode === "edit" && editingRow?.id) {
        await updateEmployee({ id: editingRow.id, data }).unwrap();
        toast.success("Data karyawan berhasil diperbarui");
      }
      setDialogOpen(false);
      refetch();
    } catch {
      toast.error("Gagal submit form / sesi telah berakhir");
      setDialogOpen(false);
    }
  };

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const handleImportCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await importEmployees(file).unwrap();
      setImportJobId(result.jobId);
      toast.info(result.message);
    } catch (err) {
      console.error(err);
      toast.error("Gagal mengupload file CSV");
    }

    event.target.value = "";
  };

  const columns: ColumnDef<Employee>[] = [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ row }) => <div className="text-center">{row.index + 1}</div>,
      enableSorting: false
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Nama <ArrowUpDown className="w-4 h-4" />
        </a>
      )
    },
    {
      accessorKey: "age",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Umur <ArrowUpDown className="w-4 h-4" />
        </a>
      )
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Posisi <ArrowUpDown className="w-4 h-4" />
        </a>
      )
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Gaji <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => <div className="text-left">{convertToRupiah(row.original.salary)}</div>
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const emp = row.original;
        return (
          <div className="flex gap-1">
            <Button size="icon" className="text-gray-600 cursor-pointer" variant="ghost" onClick={() => { setSelectedEmployee(emp); setDetailDialogOpen(true); }}><Eye /></Button>
            <Button size="icon" className="text-blue-600 cursor-pointer" variant="ghost" onClick={() => handleEdit(emp)}><Edit /></Button>
            <Button size="icon" className="text-red-600 cursor-pointer" variant="ghost" onClick={() => { setDeletingRowId(emp.id); setDeleteDialogOpen(true); }}><Trash2 /></Button>
          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: employeeData?.data ?? [],
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      pagination: { pageIndex, pageSize },
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: updater => {
      if (typeof updater === "function") {
        const next = updater({ pageIndex, pageSize });
        setPageIndex(next.pageIndex);
        setPageSize(next.pageSize);
      } else {
        setPageIndex(updater.pageIndex);
        setPageSize(updater.pageSize);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardLayout title="PT Nusantara Digital">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow px-4">
        <div className="md:flex justify-between items-center py-4 gap-2">
          <Input
            placeholder="Search..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-full md:w-48"
          />
          <div className="mt-2 md:mt-0 flex gap-2">
            <Button
              className="cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting || !!importJobId}
            >
              <Upload className="w-4 h-4" />
              {isImporting || importJobId ? "Importing..." : "Import CSV"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleImportCSV}
              className="hidden"
            />

            <Button onClick={handleAdd} className="cursor-pointer">
              <UserPlus className="w-4 h-4" />
              Tambah Karyawan
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        {importJobId && (
          <div className="py-4 px-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">
                {importError ? "Import Gagal" : "Import Progress"}
              </span>
              <span className="text-sm text-muted-foreground">
                {importError ? "Error" : `${progress}%`}
              </span>
            </div>
            <Progress
              value={importError ? 100 : progress}
              className={importError ? "h-2 bg-red-100" : "h-2"}
            />
            {importError && (
              <p className="text-xs text-red-600 mt-1">{importError}</p>
            )}
          </div>
        )}

        {/* Table */}
        <div className="overflow-auto border rounded-md">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(group => (
                <TableRow key={group.id}>
                  {group.headers.map(header => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    <Loader2 className="animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">Tidak ada data ditemukan</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center py-2">
          <div className="flex gap-1">
            <Button size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-300">
            Total Data: <span className="font-medium">{employeeData?.total ?? employeeData?.data?.length ?? 0}</span> &nbsp;|&nbsp;
            Halaman <span className="font-medium">{table.getState().pagination.pageIndex + 1}</span> dari <span className="font-medium">{table.getPageCount()}</span>
          </div>
        </div>

        {/* Add/Edit Modal */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <FormEmployee mode={editMode} initialValues={editingRow ?? undefined} onSubmit={handleFormSubmit} />
          </DialogContent>
        </Dialog>

        {/* Delete Modal */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfirmasi Hapus</DialogTitle>
              <DialogDescription>Tindakan ini tidak dapat dibatalkan. Yakin ingin menghapus?</DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Batal</Button>
              <Button variant="destructive" onClick={() => deletingRowId && handleDelete(deletingRowId)} disabled={isDeleting}>
                {isDeleting ? <Loader2 className="animate-spin w-5 h-5" /> : "Hapus"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Detail Modal */}
        <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle>Detail Karyawan</DialogTitle>
              <DialogDescription>Informasi detail karyawan.</DialogDescription>
            </DialogHeader>
            {selectedEmployee ? (
              <div className="space-y-2 text-sm">
                <div><strong>Nama:</strong> {selectedEmployee.name}</div>
                <div><strong>Umur:</strong> {selectedEmployee.age}</div>
                <div><strong>Posisi:</strong> {selectedEmployee.position}</div>
                <div><strong>Gaji:</strong> {convertToRupiah(selectedEmployee.salary)}</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDetailDialogOpen(false)}>Tutup</Button>
                </DialogFooter>
              </div>
            ) : <p className="text-sm text-muted-foreground">Tidak ada data dipilih.</p>}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
