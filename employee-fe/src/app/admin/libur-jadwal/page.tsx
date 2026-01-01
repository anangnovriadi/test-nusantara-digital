"use client";

import { useState, useEffect } from "react";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSameDay } from "date-fns";
import { useGetAllHolidaysQuery, useCreateOrUpdateHolidayMutation, useDeleteHolidayMutation } from "@/store/api/holiday-api";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  const [holidayNote, setHolidayNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  const [holidays, setHolidays] = useState<{ date: Date; note: string }[]>([]);
  const isSunday = (date: Date) => date.getDay() === 0;
  const holidayDates = holidays.map((holiday) => holiday.date);

  const { data: holidaysData, isLoading, isError, refetch } = useGetAllHolidaysQuery({});
  const [createOrUpdateHoliday] = useCreateOrUpdateHolidayMutation();
  const [deleteHoliday] = useDeleteHolidayMutation();

  useEffect(() => {
    if (holidaysData) {
      const parsed = holidaysData.data.map((h: any) => ({
        date: new Date(h.date),
        note: h.note,
      }));
      setHolidays(parsed);
    }
  }, [holidaysData]);

  useEffect(() => {
    refetch();
  }, []);

  const findHolidayByDate = (date: Date) => holidays.find((h) => isSameDay(h.date, date));
  const handleDateSelect = (date: Date | undefined) => {
    if (!date || isSunday(date)) return;

    const existingHoliday = findHolidayByDate(date);
    setSelectedDate(date);
    setHolidayNote(existingHoliday?.note || "");
    setIsEditing(!!existingHoliday);
    setOpen(true);
  };

  const formatLocalDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const handleSave = async () => {
    if (!selectedDate) return;
    
    const payload = {
      date: formatLocalDate(selectedDate),
      note: holidayNote,
    };

    setIsLoadingSave(true);

    try {
      await createOrUpdateHoliday({ data: payload }).unwrap();

      setHolidays((prev) => {
        const updated = prev.filter((h) => !isSameDay(h.date, selectedDate));
        return [...updated, { date: selectedDate, note: holidayNote }];
      });

      toast.success(`Hari libur ${isEditing ? "diperbarui" : "ditambahkan"}`);
    } catch (error) {
      console.error("❌ Gagal menyimpan hari libur:", error);
      toast.error("Gagal menyimpan hari libur / sesi telah berakhir");
    }
    
    setIsLoadingSave(false);
    setHolidayNote("");
    setSelectedDate(undefined);
    setIsEditing(false);
    setOpen(false);
  };

  const handleDelete = async () => {
    if (!selectedDate) return;

    const formattedDate = formatLocalDate(selectedDate);
    console.log(formattedDate)
    try {
      await deleteHoliday(formattedDate).unwrap();

      setHolidays((prev) => prev.filter((h) => !isSameDay(h.date, selectedDate)));
      toast.success("Hari libur dihapus");

      setSelectedDate(undefined);
      setHolidayNote("");
      setIsEditing(false);
      setOpen(false);
    } catch (error) {
      console.error("❌ Gagal menghapus hari libur:", error);
      toast.error("Gagal menghapus hari libur / sesi telah berakhir");
    }
  };

  return (
    <DashboardLayout title="Jadwal Libur">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow p-4 h-full">
        <h2 className="text-lg font-semibold mb-1">Kalender Hari Libur</h2>
        <p className="mb-4 text-sm text-muted-foreground">
          Pilih tanggal untuk menandai atau mengedit hari libur
        </p>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleDateSelect}
          locale={id}
          className="rounded-md border-none w-full dark:bg-transparent"
          disabled={(date) => isSunday(date)}
          modifiers={{
            holiday: holidayDates,
            sunday: (date) => date.getDay() === 0,
          }}
          modifiersClassNames={{
            holiday: "bg-red-500 text-white font-bold rounded-full flex items-center justify-center mx-auto",
            sunday: "text-red-600 rounded-md dark:text-white",
          }}
        />
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Hari Libur" : "Tandai Hari Libur"}
            </DialogTitle>
            <DialogDescription>
              Tanggal: {selectedDate?.toLocaleDateString("id-ID")}
            </DialogDescription>
          </DialogHeader>
          <Input
            placeholder="Catatan Hari Libur (opsional)"
            value={holidayNote}
            onChange={(e) => setHolidayNote(e.target.value)}
          />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">Cancel</Button>
            </DialogClose>
            {isEditing && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="cursor-pointer"
              >
                Hapus
              </Button>
            )}
            <Button onClick={handleSave} disabled={isLoadingSave} className="cursor-pointer">
              {isLoadingSave ? <Loader2 className="animate-spin size-5" /> : 'Simpan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
