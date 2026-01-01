"use client";

import * as React from "react";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  fullname: z.string().min(1, "Full Name wajib diisi"),
});

type SettingFormValues = z.infer<typeof settingSchema>;

export default function Page() {
  const { data: settingData } = useGetDetailSettingQuery({});
  const [updateSetting, { isLoading: isUpdating }] = useUpdateSettingMutation();

  const [editMode, setEditMode] = React.useState(false);

  const form = useForm<SettingFormValues>({
    resolver: zodResolver(settingSchema),
    defaultValues: {
      fullname: "",
    },
  });

  React.useEffect(() => {
    if (settingData?.data) {
      form.reset({
        fullname: settingData.data.fullname ?? "",
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
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Full Name"
                          {...field}
                          readOnly={!editMode}
                          className={!editMode ? "bg-muted text-muted-foreground cursor-not-allowed" : ""}
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
