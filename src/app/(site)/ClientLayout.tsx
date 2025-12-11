/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import "@/styles/globals.css";
import { Geist } from "next/font/google";
import PageLayout from "@/components/PageLayout";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/components/common/ToastContext";
import { usePathname } from "next/navigation";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700", "800"],
});

// Add a custom App with getInitialProps
function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Allow overflow-x on profile page for CSS sticky to work
  const isProfilePage = pathname === "/profile" || pathname?.startsWith("/user/");
  
  return (
    <AuthProvider>
      <ToastProvider>
        <main className={`${geist.variable} font-geist`}>
          <PageLayout allowOverflowX={isProfilePage}>
            {children}
          </PageLayout>
        </main>
      </ToastProvider>
    </AuthProvider>
  );
}

// Attach getInitialProps to extract cookies from server
ClientLayout.getInitialProps = async ({ ctx }: any) => {
  const cookies = ctx.req?.headers?.cookie ?? null;

  return {
    pageProps: {
      cookies,
    },
  };
};

export default ClientLayout;
