import { FC, useEffect } from "react";
import { id } from "date-fns/locale";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreateStudentRequest } from "@/store/api/student-api"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Loader2 } from "lucide-react";

type Props = {
  mode: "add" | "edit"
  initialValues: CreateStudentRequest | undefined
  onSubmit?: (data: CreateStudentRequest) => void
}

const FormSchema = z.object({
  name: z.string().min(1, "Nama Siswa wajib diisi"),
  nisn: z.string().min(1, "NISN wajib diisi"),
  date_of_birth: z.date({
    required_error: "Tanggal Lahir wajib diisi",
    invalid_type_error: "Tanggal tidak valid",
  }),
  gender: z.string().min(1, "Jenis Kelamin wajib dipilih"),
  address: z.string().min(1, "Alamat wajib diisi"),
})

const FormSiswa: FC<Props> = ({ mode, initialValues, onSubmit }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      nisn: "",
      date_of_birth: undefined,
      gender: "",
      address: "",
    },
  })

  useEffect(() => {
    if (initialValues) {
      form.reset({
        ...initialValues,
        date_of_birth: initialValues.date_of_birth
          ? new Date(initialValues.date_of_birth)
          : undefined,
        gender: "",
      });

      setTimeout(() => {
        form.setValue(
          "gender",
          initialValues.gender?.toLowerCase() === "laki-laki"
            ? "Laki-laki"
            : initialValues.gender?.toLowerCase() === "perempuan"
            ? "Perempuan"
            : ""
        );
      }, 0);
    } else {
      form.reset({
        name: "",
        nisn: "",
        date_of_birth: undefined,
        gender: "",
        address: "",
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    const payload: CreateStudentRequest = {
      ...values,
      date_of_birth: format(values.date_of_birth, "yyyy-MM-dd"),
    }

    await onSubmit?.(payload)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edit Siswa" : "Tambah Siswa"}</DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Perbarui informasi siswa"
              : "Silakan masukkan informasi siswa"}
          </DialogDescription>
        </DialogHeader>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Siswa *</FormLabel>
              <FormControl>
                <Input placeholder="Nama siswa" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="nisn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>NISN *</FormLabel>
              <FormControl>
                <Input placeholder="NISN" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date_of_birth"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Tanggal Lahir *</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={`
                        w-full pl-3 text-left font-normal
                        ${!field.value ? "text-muted-foreground" : ""}
                        ${form.formState.errors.date_of_birth ? "border-red-500" : ""}
                      `}
                    >
                      {field.value ? format(field.value, "dd/MM/yyyy") : "Pilih tanggal"}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    locale={id}
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date()}
                    captionLayout="dropdown"
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="gender"
          render={({ field }) => {
            return (
              <FormItem>
                <FormLabel>Jenis Kelamin *</FormLabel>
                <FormControl>
                  <Select
                    value={field.value ?? ""}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      className={`w-full ${form.formState.errors.gender ? "border-red-500" : ""}`}
                    >
                      <SelectValue placeholder="Pilih jenis kelamin" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Laki-laki">Laki-laki</SelectItem>
                      <SelectItem value="Perempuan">Perempuan</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Alamat *</FormLabel>
              <FormControl>
                <Textarea className="h-24" placeholder="Alamat" {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter className="pt-2">
          <DialogClose asChild>
            <Button variant="outline" className="cursor-pointer">Cancel</Button>
          </DialogClose>
          <Button
            type="submit"
            disabled={(mode === "add" && !form.formState.isValid) || form.formState.isSubmitting}
            className="cursor-pointer"
          >
            {form.formState.isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Simpan'}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  )
}

export default FormSiswa
