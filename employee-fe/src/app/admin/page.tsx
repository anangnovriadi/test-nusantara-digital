"use client";

import DashboardLayout from "@/components/layouts/layout-dashboard";

export default function Page() {
  return (
    <DashboardLayout title="Dashboard">
      <div className="bg-gray-500 dark:bg-sidebar text-white rounded-lg p-8 mb-6 shadow-md">
        <h1 className="text-xl font-bold mb-2">Welcome Back</h1>
        <p className="text-sm">
          We're glad to see you again. Explore your dashboard and manage your data efficiently.
        </p>
      </div>
    </DashboardLayout>
  );
}
