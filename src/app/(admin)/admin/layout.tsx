import { ReactNode } from "react";
import { AdminAuthProvider } from "../context/AdminAuthContext";
import { AdminLayoutContent } from "../components/AdminLayoutContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Bluff Platform",
  description: "Admin dashboard for Bluff platform",
};

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminAuthProvider>
  );
}
