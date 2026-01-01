"use client";

import * as React from "react";
import { useEffect, useState } from "react";
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
import { ArrowUpDown, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import FormEmployee from "@/components/form-employee";
import {
  Employee,
  CreateEmployeeRequest,
  useGetAllEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from "@/store/api/employee-api";
import { toast } from "sonner";

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
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

  useEffect(() => {
    refetch();
  }, []);

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
    } catch (error) {
      console.error("Gagal menghapus data karyawan:", error);
      toast.error("Gagal menghapus data karyawan / sesi telah berakhir");
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
    } catch (err) {
      console.error("Gagal submit form:", err);
      toast.error("Gagal submit form / sesi telah berakhir");
      setDialogOpen(false);
    }
  };

  const columns: ColumnDef<Employee>[] = [
    {
      id: "number",
      header: () => <div className="text-center">#</div>,
      cell: ({ table, row }) => {
        const rows = table.getPaginationRowModel().rows;
        const indexOnPage = rows.findIndex(r => r.id === row.id);
        const pageIndex = table.getState().pagination.pageIndex;
        const pageSize = table.getState().pagination.pageSize;
        return <div className="text-center">{pageIndex * pageSize + indexOnPage + 1}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Nama <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
    },
    {
      accessorKey: "age",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Umur <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
    },
    {
      accessorKey: "position",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Posisi <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
    },
    {
      accessorKey: "salary",
      header: ({ column }) => (
        <a onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} className="cursor-pointer flex items-center gap-1">
          Gaji <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setSelectedEmployee(employee); setDetailDialogOpen(true); }}
              className="text-blue-600 hover:text-blue-800"
            >
              <Eye />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => handleEdit(employee)}
              className="text-green-600 hover:text-green-800"
            >
              <Edit />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setDeletingRowId(employee.id); setDeleteDialogOpen(true); }}
              className="text-red-600 hover:text-red-800"
            >
              <Trash2 />
            </Button>

          </div>
        );
      },
      enableSorting: false,
    },
  ];

  const table = useReactTable({
    data: employeeData?.data ?? [],
    columns,
    state: { sorting, columnFilters, columnVisibility, rowSelection, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 5 } },
  });

  return (
    <DashboardLayout title="Manajemen Karyawan">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow px-4 overflow-x-auto">
        {/* Header + Search + Add */}
        <div className="md:flex justify-between items-center py-4">
          <Input placeholder="Search..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full md:w-48"/>
          <Button onClick={handleAdd} className="mt-2 md:mt-0 cursor-pointer">Tambah Karyawan</Button>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center h-24">
                    <Loader2 className="animate-spin w-5 h-5 mx-auto" /> Memuat data karyawan...
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
        <div className="flex items-center justify-between py-4">
          <div className="text-sm text-muted-foreground">
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to {Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, employeeData?.data.length ?? 0)} of {employeeData?.data.length ?? 0} entries
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
            <Button size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
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
                <div><strong>Gaji:</strong> {selectedEmployee.salary}</div>
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
