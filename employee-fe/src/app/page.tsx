"use client";

import { useState, useEffect } from "react";
import { id } from "date-fns/locale";
import { Frown, Meh, ThumbsUp, ThumbsDown, ArrowDownAZ, ArrowDownZA, Loader2 } from "lucide-react";
import { Calendar as CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent,PopoverTrigger } from "@/components/ui/popover";
import {
  useGetDetailSettingPublicQuery,
  useGetAllStudentsPublicQuery,
  useCreateOrUpdateAttendancePublicMutation
} from "@/store/api/homepage-api";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { Calendar } from "@/components/ui/calendar";
import { useGetAllHolidaysPublicQuery } from "@/store/api/homepage-api";
import { Input } from "@/components/ui/input";

export default function Home() {
  const [sortAsc, setSortAsc] = useState(true);
  const toggleSort = () => setSortAsc((prev) => !prev);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isClient, setIsClient] = useState(false);
  const [attendanceStatusMap, setAttendanceStatusMap] = useState<Record<number, string>>({});
  const [isMarkingAllPresent, setIsMarkingAllPresent] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [open, setOpen] = useState(false);
  const token = useSelector((state: any) => state.auth.token);
  const isLoggedIn = Boolean(token);
  const isSunday = date?.getDay() === 0;
  const formattedDate = date ? new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split("T")[0] : "";
  const [holidays, setHolidays] = useState<{ date: Date; note: string }[]>([]);
  const { data: holidaysData, isLoading: isLoadingHolidaysData } = useGetAllHolidaysPublicQuery({});
  const holidayDates = holidays.map((holiday) => holiday.date);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (holidaysData) {
      const parsed = holidaysData.data.map((h: any) => ({
        date: new Date(h.date),
        note: h.note,
      }));
      setHolidays(parsed);
    }
  }, [holidaysData]);

  const { data: settingData } = useGetDetailSettingPublicQuery({});
  const { data: studentsData, isLoading } = useGetAllStudentsPublicQuery({
    attendance_date: formattedDate
  });
  const [createOrUpdateAttendance, { isLoading: isCreateOrUpdating }] = useCreateOrUpdateAttendancePublicMutation();

  useEffect(() => {
    setIsClient(true);
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
  if (studentsData?.data && formattedDate) {
    const map: Record<number, string> = {};

    studentsData.data.forEach((student: any) => {
      const selectedAttendance = student.attendance?.find(
        (att: any) => att.attendance_date === formattedDate
      );
      if (selectedAttendance?.status) {
        map[student.id] = selectedAttendance.status;
      }
    });

    setAttendanceStatusMap(map);
  }
}, [studentsData, formattedDate]);

  const students = studentsData?.data || [];
  const sortedStudents = [...students].sort((a, b) =>
    sortAsc ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
  );

  const handleAttendanceClick = async (studentId: number, status: string) => {
    try {
      await createOrUpdateAttendance({
        data: {
          student_id: Number(studentId),
          status,
          attendance_date: formattedDate,
        }
      }).unwrap();

      setAttendanceStatusMap((prev) => ({
        ...prev,
        [studentId]: status
      }));

      toast.success(`Presensi berhasil dengan status ${status}`);
      console.log(`Presensi berhasil untuk ${studentId} dengan status ${status}`);
    } catch (error) {
      toast.error('Gagal mengisi presensi / sesi telah berakhir');
      console.error("Gagal mengisi presensi:", error);
    }
  };

  const isSelected = (studentId: number, status: string) => {
    return attendanceStatusMap[studentId] === status;
  };

  const handleMarkAllPresent = async () => {
    setIsMarkingAllPresent(true);

    try {
      for (const student of students) {
        await createOrUpdateAttendance({
          data: {
            student_id: student.id,
            status: "HADIR",
            attendance_date: formattedDate,
          },
        }).unwrap();

        setAttendanceStatusMap((prev) => ({
          ...prev,
          [student.id]: "HADIR",
        }));
      }

      toast.success('Semua siswa telah di-set hadir');
      console.log("Semua siswa telah di-set hadir");
    } catch (error) {
      toast.error('Gagal set hadir semua / sesi telah berakhir');
      console.error("Gagal set hadir semua:", error);
    } finally {
      setIsMarkingAllPresent(false);
    }
  };

  const filteredStudents = sortedStudents.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isClient) return null;

  return (
    <>
      <div className="p-5 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
        {settingData?.data ? (
          <div>
            <p className="text-gray-800 text-center font-bold md:text-left dark:text-gray-200 text-sm mt-1">
              {settingData?.data.school_name}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-5 w-[260px]" />
          </div>
        )}
      </div>
      <div className="mt-4 p-5 border rounded-md bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
        <div className="mb-4 border-b pb-4">
          <div className="flex justify-center md:justify-start items-center gap-2 text-gray-800 dark:text-gray-200 font-medium">
            <span>
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          {!isClient ? (
            <Skeleton className="h-4 w-[100px]" />
          ) : (
            <div className="flex justify-center md:justify-start items-center gap-2 text-gray-800 dark:text-gray-200 font-medium mt-1">
              <span>
                {currentTime.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                })}
              </span>
            </div>
          )}
        </div>

        {settingData?.data ? (
          <div>
            <p className="text-gray-800 text-center md:text-left dark:text-gray-200 text-sm mt-1">
              Tahun Ajaran {settingData?.data.school_year}
            </p>
            
            <p className="text-gray-800 text-center md:text-left dark:text-gray-200 text-sm mt-1">
              Tingkat Pendidikan {settingData?.data?.level_of_education}
            </p>
            <p className="text-gray-800 text-center md:text-left dark:text-gray-200 text-sm mt-1">
              Wali Kelas: {settingData?.data?.fullname}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Skeleton className="h-5 w-[260px]" />
            <Skeleton className="h-5 w-[280px]" />
            <Skeleton className="h-5 w-[200px]" />
          </div>
        )}
      </div>

      <div className="mt-4 border shadow-sm bg-white rounded-md dark:bg-gray-900 dark:border-gray-700">
        <div className="border-b px-5 py-4 grid grid-cols-1 md:grid-cols-2 justify-between items-center gap-2">
          <div className="flex flex-col md:flex-row justify-center md:justify-start gap-2 mb-1 md:mb-0">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  id="date-picker"
                  variant="outline"
                >
                  <CalendarIcon size={18} />
                  <span>{formattedDate || "Pilih tanggal"}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  locale={id}
                  defaultMonth={date}
                  onSelect={(date) => {
                    setDate(date || undefined);
                    setOpen(false);
                  }}
                  modifiers={{
                    holiday: holidayDates,
                    sunday: (date) => date.getDay() === 0,
                  }}
                  modifiersClassNames={{
                    holiday: "bg-red-500 text-white font-bold rounded-full w-2 h-2 flex items-center justify-center mx-auto",
                    sunday: "text-red-600 rounded-md dark:text-white",
                  }}
                  disabled={(date) => {
                    const today = new Date();
                    return date > today;
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="outline"
              onClick={toggleSort}
              className="font-normal cursor-pointer w-full md:w-auto"
            >
              {sortAsc ? <ArrowDownAZ /> : <ArrowDownZA />}
              Sort {sortAsc ? "A–Z" : "Z–A"}
            </Button>
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full md:w-48 text-center md:text-left placeholder:text-center md:placeholder:text-left"
            />
          </div>
          <Button
            className="w-auto md:justify-self-end cursor-pointer flex items-center justify-center"
            onClick={handleMarkAllPresent}
            disabled={!isLoggedIn || isMarkingAllPresent || filteredStudents.length == 0}
            variant="default"
          >
            {isMarkingAllPresent ? (
              <Loader2 className="animate-spin size-5" />
            ) : 'Hadir Semua'}
          </Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="animate-spin size-10" />
          </div>
        ) : sortedStudents.length == 0 ? (
          <div className="flex justify-center items-center h-40 text-gray-500 text-sm">
            Tidak ada data siswa untuk ditampilkan
          </div>
        ) : (
          <div className="p-5 my-4 grid grid-cols-1 lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-2 gap-4 space-y-2">
            {formattedDate && holidayDates.some((holidayDate) => holidayDate.toISOString().split('T')[0] === formattedDate) ? (
              <div className="col-span-full text-center text-sm p-8 text-gray-500">
                Presensi tidak tersedia pada tanggal tersebut
                <p className="mt-2">
                  <Badge
                    variant="outline"
                    className="bg-red-500 text-white whitespace-normal break-words max-w-full"
                  >
                    Keterangan: {holidays.find((holiday) => holiday.date.toISOString().split('T')[0] === formattedDate)?.note || '-'}
                  </Badge>
                </p>
              </div>
            ) : isSunday ? (
              <div className="col-span-full text-center text-sm p-8 text-gray-500">
                Presensi tidak tersedia pada hari minggu
              </div>
            ) : (
              filteredStudents.map((student) => (
                <div key={student.id}>
                  <div className="mb-1 flex justify-center">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="link" className="cursor-pointer">{student.name}</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80" side="top" align="center">
                        <div>
                          <div className="flex justify-center gap-2">
                            <Badge variant="outline" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                              {student.gender}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <p className="text-muted-foreground text-sm text-center dark:text-gray-400">
                              {student.address}
                            </p>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="grid grid-cols-2 bg-gray-100 dark:bg-gray-900 gap-2 border p-4 rounded-md">
                    <Button
                      variant={isSelected(student.id, "HADIR") ? "default" : "outline"}
                      disabled={!isLoggedIn}
                      className={`cursor-pointer ${
                        isSelected(student.id, "HADIR") ? "bg-yellow-500 text-white" : "hover:bg-yellow-500 hover:text-white"
                      }`}
                      onClick={() => handleAttendanceClick(student.id, "HADIR")}
                    >
                      <ThumbsUp className="mr-2 h-4 w-4" />
                      Hadir
                    </Button>
                    <Button
                      variant={isSelected(student.id, "SAKIT") ? "default" : "outline"}
                      disabled={!isLoggedIn}
                      className={`cursor-pointer ${
                        isSelected(student.id, "SAKIT") ? "bg-blue-500 text-white" : "hover:bg-blue-500 hover:text-white"
                      }`}
                      onClick={() => handleAttendanceClick(student.id, "SAKIT")}
                    >
                      <Frown className="mr-2 h-4 w-4" />
                      Sakit
                    </Button>
                    <Button
                      variant={isSelected(student.id, "IJIN") ? "default" : "outline"}
                      disabled={!isLoggedIn}
                      className={`cursor-pointer ${
                        isSelected(student.id, "IJIN") ? "bg-emerald-500 text-white" : "hover:bg-emerald-500 hover:text-white"
                      }`}
                      onClick={() => handleAttendanceClick(student.id, "IJIN")}
                    >
                      <Meh className="mr-2 h-4 w-4" />
                      Ijin
                    </Button>
                    <Button
                      variant={isSelected(student.id, "TANPA KETERANGAN") ? "default" : "outline"}
                      disabled={!isLoggedIn}
                      className={`cursor-pointer ${
                        isSelected(student.id, "TANPA KETERANGAN") ? "bg-red-500 text-white" : "hover:bg-red-500 hover:text-white"
                      }`}
                      onClick={() => handleAttendanceClick(student.id, "TANPA KETERANGAN")}
                    >
                      <ThumbsDown className="mr-2 h-4 w-4" />
                      Tanpa Ket.
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
}
