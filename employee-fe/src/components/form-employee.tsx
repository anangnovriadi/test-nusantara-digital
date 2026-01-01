import { FC, useEffect } from "react";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import {
  CreateEmployeeRequest,
  Employee,
} from "@/store/api/employee-api";

/* ======================
   TYPES
====================== */

type Props = {
  mode: "add" | "edit";
  initialValues?: Employee;
  onSubmit?: (data: CreateEmployeeRequest) => Promise<void>;
};

const FormSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  age: z.coerce.number().min(18, "Minimal umur 18 tahun"),
  position: z.string().min(1, "Posisi wajib diisi"),
  salary: z.coerce.number().min(0, "Gaji tidak boleh negatif"),
});

const FormEmployee: FC<Props> = ({ mode, initialValues, onSubmit }) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    mode: "onChange",
    defaultValues: {
      name: "",
      age: 18,
      position: "",
      salary: 0,
    },
  });

  useEffect(() => {
    if (initialValues) {
      form.reset({
        name: initialValues.name,
        age: initialValues.age,
        position: initialValues.position,
        salary: initialValues.salary,
      });
    } else {
      form.reset({
        name: "",
        age: 18,
        position: "",
        salary: 0,
      });
    }
  }, [initialValues, form]);

  const handleSubmit = async (values: z.infer<typeof FormSchema>) => {
    const payload: CreateEmployeeRequest = {
      ...values,
    };

    await onSubmit?.(payload);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DialogHeader>
          <DialogTitle>
            {mode === "edit" ? "Edit Karyawan" : "Tambah Karyawan"}
          </DialogTitle>
          <DialogDescription>
            {mode === "edit"
              ? "Perbarui informasi karyawan"
              : "Silakan masukkan informasi karyawan"}
          </DialogDescription>
        </DialogHeader>

        {/* Nama */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama *</FormLabel>
              <FormControl>
                <Input placeholder="Nama karyawan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Umur */}
        <FormField
          control={form.control}
          name="age"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Umur *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Umur" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Posisi */}
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Posisi *</FormLabel>
              <FormControl>
                <Input placeholder="Posisi pekerjaan" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Gaji */}
        <FormField
          control={form.control}
          name="salary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gaji *</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Gaji" {...field} />
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
            className="cursor-pointer"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="animate-spin size-5" />
            ) : mode === "edit" ? (
              "Update"
            ) : (
              "Simpan"
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};

export default FormEmployee;
