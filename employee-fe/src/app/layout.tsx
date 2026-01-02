"use client";

import Layout from "@/components/layouts/layout";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from 'sonner';
import NProgressLoader from "@/components/nprogress-loader";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>Manajemen Karyawan</title>
        <meta name="description" content="Manajemen Karyawan" />
      </head>
      <body className="bg-gray-50 dark:bg-black text-black dark:text-white">
        <Providers>
          <Layout>
            <NProgressLoader />
            {children}
          </Layout>
          <Toaster richColors position="top-center" />
        </Providers>
      </body>
    </html>
  );
}
