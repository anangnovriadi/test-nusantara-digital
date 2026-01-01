"use client";

import * as React from "react";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  useGetDetailSettingQuery,
  useUpdateSettingMutation,
} from "@/store/api/setting-api";
import { Edit, Eye, Loader2 } from "lucide-react";

const settingSchema = z.object({
  fullname: z.string().min(1, "Nama wajib diisi"),
  nip: z.string().min(1, "NIP wajib diisi"),
  school_name: z.string().min(1, "Nama sekolah wajib diisi"),
  principal_name: z.string().min(1, "Kepala sekolah wajib diisi"),
  principal_nip: z.string().min(1, "NIP Kepala sekolah wajib diisi"),
  school_year: z.string().min(1, "Tahun ajaran wajib diisi"),
  level_of_education: z.string().min(1, "Tingkat pendidikan wajib diisi"),
  about: z.string().optional(),
  address: z.string().min(1, "Alamat wajib diisi"),
});

type SettingFormValues = z.infer<typeof settingSchema>;

export default function Page() {
  const { data: settingData } = useGetDetailSettingQuery({});
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [editMode, setEditMode] = React.useState(false); // ⬅️ New state

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      fullname: "",
      nip: "",
      school_name: "",
      principal_name: "",
      principal_nip: "",
      school_year: "",
      level_of_education: "",
      about: "",
      address: "",
    },
  });

  React.useEffect(() => {
    if (settingData?.data) {
      form.reset({
        fullname: settingData.data.fullname ?? "",
        nip: settingData.data.nip ?? "",
        school_name: settingData.data.school_name ?? "",
        principal_name: settingData.data.principal_name ?? "",
        principal_nip: settingData.data.principal_nip ?? "",
        school_year: settingData.data.school_year ?? "",
        level_of_education: settingData.data.level_of_education ?? "",
        about: settingData.data.about ?? "",
        address: settingData.data.address ?? "",
      });
    }
  }, [settingData, form]);

  const onSubmit = async (values: SettingFormValues) => {
    try {
      await updateSetting({ data: values }).unwrap();
      toast.success("Pengaturan berhasil diperbarui");
      setEditMode(false);
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan / sesi telah berakhir");
    }
  };

  return (
    <DashboardLayout title="Settings">
      <div className="bg-white dark:bg-muted/50 rounded-md shadow overflow-x-auto">
        <div className="w-full">
          <div className="border-b px-4 py-2.5 bg-secondary flex items-center justify-between">
            <h2 className="text-lg font-semibold">General Settings</h2>
            <a
              onClick={() => setEditMode((prev) => !prev)}
              title={editMode ? "Lihat Mode" : "Edit Mode"}
              className={`cursor-pointer ${editMode ? 'text-gray-600 hover:text-gray-800 dark:hover:text-gray-600' : 'text-blue-600 hover:text-blue-800 dark:hover:text-blue-600'}`}
            >
              {editMode ? <Eye size={18} /> : <Edit size={18} />}
            </a>
          </div>

          <div className="space-y-4 px-4 py-4">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Full Name */}
                <FormField
                  control={form.control}
                  name="fullname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Anda *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama Anda"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NIP */}
                <FormField
                  control={form.control}
                  name="nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Anda *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NIP Anda"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Name */}
                <FormField
                  control={form.control}
                  name="school_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Sekolah *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nama Sekolah"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Principal Name */}
                <FormField
                  control={form.control}
                  name="principal_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kepala Sekolah Anda *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Kepala Sekolah Anda"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* NIP Principal Name */}
                <FormField
                  control={form.control}
                  name="principal_nip"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>NIP Kepala Sekolah Anda *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="NIP Kepala Sekolah Anda"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* School Year */}
                <FormField
                  control={form.control}
                  name="school_year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tahun Ajaran *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tahun Ajaran"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Level of Education */}
                <FormField
                  control={form.control}
                  name="level_of_education"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tingkat Pendidikan *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Tingkat Pendidikan"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Address */}
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alamat Sekolah Anda *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Alamat Sekolah Anda"
                          className={`h-30 ${!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}`}
                          {...field}
                          readOnly={!editMode}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Submit Button */}
                {editMode && (
                  <Button
                    type="submit"
                    disabled={form.formState.isSubmitting}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    {form.formState.isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Simpan Perubahan'}
                  </Button>
                )}
              </form>
            </Form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
