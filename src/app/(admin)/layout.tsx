import "@/styles/globals.css";
import { ReactNode } from "react";
import { Geist } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import ContextProvider from "@/providers/ContextProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { wagmiAdapter } from "@/config/wagmi";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthProvider";
import { ToastProvider } from "@/components/common/ToastContext";
import type { Metadata } from "next";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Admin - Bluff Platform",
  description: "Admin area for Bluff platform",
  themeColor: "#010101",
};

export default async function AdminRootLayout({ children }: { children: ReactNode }) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig,
    (await headers()).get("cookie")
  );

  return (
    <html lang="en">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      </head>
      <body className={`${geist.variable} font-geist antialiased overflow-x-hidden`}>
        <SessionProvider
          refetchInterval={0}
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <TooltipProvider delayDuration={0}>
            <ContextProvider initialState={initialState}>
              <AuthProvider>
                <ToastProvider>
                  <ThemeProvider>
                    {children}
                  </ThemeProvider>
                </ToastProvider>
              </AuthProvider>
              <Toaster
                position="top-center"
                toastOptions={{
                  style: {
                    zIndex: 99999,
                    fontSize: "14px",
                  },
                }}
              />
            </ContextProvider>
          </TooltipProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
