"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DashboardLayout from "@/components/layouts/layout-dashboard";
import {
    useGetUserProfileQuery,
    useUpdateUserProfileMutation,
} from "@/store/api/setting-api";
import { toast } from "sonner";
import { Loader2, Save, User } from "lucide-react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function SettingsPage() {
    const { data: userProfile, isLoading } = useGetUserProfileQuery();
    const [updateProfile, { isLoading: isUpdating }] = useUpdateUserProfileMutation();

    const [fullname, setFullname] = useState("");

    React.useEffect(() => {
        if (userProfile) {
            setFullname(userProfile.fullname);
        }
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!fullname.trim()) {
            toast.error("Full name tidak boleh kosong");
            return;
        }

        try {
            await updateProfile({ fullname }).unwrap();
            toast.success("Profile berhasil diperbarui");
        } catch (error) {
            toast.error("Gagal memperbarui profile");
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout title="Pengaturan">
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout title="Pengaturan">
            <div className="w-full">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <User className="w-5 h-5" />
                            <CardTitle>Profile Pengguna</CardTitle>
                        </div>
                        <CardDescription>
                            Kelola informasi profile Anda
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="fullname">Full Name</Label>
                                <Input
                                    id="fullname"
                                    type="text"
                                    value={fullname}
                                    onChange={(e) => setFullname(e.target.value)}
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={userProfile?.email || ""}
                                    readOnly
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Email tidak dapat diubah
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="cursor-pointer"
                                >
                                    {isUpdating ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
