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
import { ArrowUpDown, Edit, Trash2, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogHeader, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import FormSiswa from "@/components/form-siswa";
import {
  StudentDetail,
  CreateStudentRequest,
  useGetAllStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeleteStudentMutation
} from "@/store/api/student-api";
import { useSelector } from "react-redux";
import { toast } from "sonner";

export default function Page() {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = useState({})
  const [globalFilter, setGlobalFilter] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState<"add" | "edit">("add");
  const [editingRow, setEditingRow] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingRowId, setDeletingRowId] = useState<number | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentDetail | null>(null);

  const { data: studentData, isLoading, isError, refetch } = useGetAllStudentsQuery({});
  const [createStudent, { isLoading: isCreating, error: createError }] = useCreateStudentMutation();
  const [updateStudent, { isLoading: isUpdating, error: updateError }] = useUpdateStudentMutation();
  const [deleteStudent, { isLoading: isDeleting }] = useDeleteStudentMutation();

  const user = useSelector((state: any) => state.auth.user);
  const userId = user?.user_id;

  useEffect(() => {
    refetch();
  }, []);
  
  const handleEdit = (row: StudentDetail) => {
    setEditMode("edit")
    setEditingRow({
      id: row.id,
      name: row.name,
      nisn: row.nisn,
      date_of_birth: row.date_of_birth,
      gender: row.gender,
      address: row.address
    })
    setDialogOpen(true)
  }

  const handleAdd = () => {
    setEditMode("add")
    setEditingRow(null)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteStudent(id).unwrap();
      toast.success("Data siswa berhasil dihapus");
      setDeleteDialogOpen(false);
      setDeletingRowId(null);
      refetch();
    } catch (error) {
      console.error("Gagal menghapus data siswa:", error);
      toast.error("Gagal menghapus data siswa / sesi telah berakhir");
      setDeleteDialogOpen(false);
    }
  };

  const handleFormSubmit = async (data: CreateStudentRequest) => {
    try {
      const payload = { ...data, user_id: userId };

      if (editMode === "add") {
        await createStudent(payload).unwrap();
        toast.success("Data siswa berhasil ditambahkan");
      } else if (editMode === "edit" && editingRow?.id) {
        await updateStudent({ id: editingRow.id, data: payload }).unwrap();
        toast.success("Data siswa berhasil diperbarui");
      }
      setDialogOpen(false);
      refetch();
    } catch (err) {
      console.error("Gagal submit form:", err);
      toast.error("Gagal submit form / sesi telah berakhir");
      setDialogOpen(false);
    }
  };

  const columns: ColumnDef<StudentDetail>[] = [
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
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium dark:text-white"
        >
          Nama Siswa
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => (
        <div className="py-2">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "gender",
      header: ({ column }) => (
        <a
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium dark:text-white"
        >
          Jenis Kelamin
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => (
        <div className="">{row.getValue("gender")}</div>
      ),
    },
    {
      accessorKey: "date_of_birth",
      header: ({ column }) => (
        <a
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="cursor-pointer inline-flex items-center gap-1 text-sm font-medium dark:text-white"
        >
          Tanggal Lahir
          <ArrowUpDown className="w-4 h-4" />
        </a>
      ),
      cell: ({ row }) => (
        <div className="">{row.getValue("date_of_birth")}</div>
      ),
    },
    {
      id: "actions",
      header: () => <div className="ml-2">Actions</div>,
      cell: ({ row }) => {
        const student = row.original;

        return (
          <div className="flex">
            <Button
              variant="ghost"
              size="icon"
              className="text-gray-600 hover:text-gray-800 dark:hover:text-gray-600 cursor-pointer"
              onClick={() => {
                setSelectedStudent(student);
                setDetailDialogOpen(true);
              }}
            >
              <Eye />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-600 hover:text-blue-800 dark:hover:text-blue-600 cursor-pointer"
              onClick={() => handleEdit(student)}
            >
              <Edit />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600 hover:text-red-800 dark:hover:text-red-600 cursor-pointer"
              onClick={() => {
                setDeletingRowId(student.id);
                setDeleteDialogOpen(true);
              }}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: studentData?.data ?? [],
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

  return (
    <DashboardLayout title="Manajemen Siswa">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow px-4 overflow-x-auto">
        <div className="w-full">
          <div className="md:flex justify-between items-center py-4">
            <Input
              placeholder="Search..."
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full md:w-48 text-center md:text-left placeholder:text-center md:placeholder:text-left"
            />
            <div className="mt-2.5 md:mt-0">
              <Button onClick={handleAdd} className="cursor-pointer w-full md:w-auto">
                Tambah Siswa
              </Button>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                  <FormSiswa
                    mode={editMode}
                    initialValues={editingRow ?? undefined}
                    onSubmit={handleFormSubmit}
                  />
                </DialogContent>
              </Dialog>

              {/* Delete Confirmation */}
              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="[&>[data-dialog-close]]:cursor-pointer">
                  <DialogTitle>Apakah Anda yakin?</DialogTitle>
                  <p className="text-sm text-muted-foreground">
                    Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin ingin menghapus data ini?
                  </p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <Button
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => setDeleteDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      variant="destructive"
                      className="cursor-pointer"
                      onClick={() => deletingRowId && handleDelete(deletingRowId)}
                      disabled={isDeleting}
                    >
                      {isDeleting ? (
                        <Loader2 className="animate-spin size-5" />
                      ) : (
                        "Hapus"
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              {/* End Delete Confirmation */}

              {/* Detail */}
              <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
                <DialogContent className="sm:max-w-[480px]">
                  <DialogHeader>
                    <DialogTitle>Detail Siswa</DialogTitle>
                    <DialogDescription>
                      Informasi detail siswa.
                    </DialogDescription>
                  </DialogHeader>
                  
                  {selectedStudent ? (
                    <div className="space-y-4">
                      <div className="space-y-3 text-sm">
                        <div>
                          <dt className="text-muted-foreground font-medium">Nama Siswa</dt>
                          <div className="text-foreground">{selectedStudent.name}</div>
                        </div>
                         <div>
                          <dt className="text-muted-foreground font-medium">NISN</dt>
                          <div className="text-foreground">{selectedStudent.nisn}</div>
                        </div>
                        <div>
                          <dt className="text-muted-foreground font-medium">Jenis Kelamin</dt>
                          <div className="text-foreground">{selectedStudent.gender}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground font-medium">Tanggal Lahir</div>
                          <div className="text-foreground">{selectedStudent.date_of_birth}</div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="text-muted-foreground font-medium">Alamat</div>
                          <div className="text-foreground">{selectedStudent.address}</div>
                        </div>
                      </div>

                      <DialogFooter className="pt-2">
                        <Button variant="outline" onClick={() => setDetailDialogOpen(false)} className="cursor-pointer">
                          Cancel
                        </Button>
                      </DialogFooter>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Tidak ada data siswa dipilih.</p>
                  )}
                </DialogContent>
              </Dialog>
              {/* End Detail */}
            </div>
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
                        <span className="text-sm text-muted-foreground">Memuat data siswa...</span>
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
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
                    studentData?.data?.length ?? 0
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium">{studentData?.data?.length ?? 0}</span> entries
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
