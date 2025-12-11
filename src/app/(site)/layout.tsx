import "@/styles/globals.css";
import { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import ContextProvider from "@/providers/ContextProvider";
import { wagmiAdapter } from "@/config/wagmi";
import ClientLayout from "./ClientLayout";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
// import GrainOverlay from "./glow";
import { TooltipProvider } from "@/components/ui/tooltip-old";
import Script from "next/script";
import { HeaderModalProvider } from "@/hooks/use-header-modal";
import { Analytics } from "@vercel/analytics/next";

export const metadata: Metadata = {
  title: "Bluff | The First AI-Powered Prediction Market",
  description: "Bluff transforms predictions into liquid markets where belief turns liquid and conviction gets tested. Trade markets, back your views, and claim winnings.",
  keywords: ["crypto", "trading", "prediction markets", "social trading", "blockchain", "defi", "AI-powered", "liquid markets"],
  authors: [{ name: "Bluff" }],
  creator: "Bluff",
  publisher: "Bluff",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://bluff.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    title: 'Bluff | The First AI-Powered Prediction Market',
    description: 'Bluff transforms predictions into liquid markets where belief turns liquid and conviction gets tested. Trade markets, back your views, and claim winnings.',
    siteName: 'Bluff',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bluff | The First AI-Powered Prediction Market',
      },
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bluff | The First AI-Powered Prediction Market',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bluff | The First AI-Powered Prediction Market',
    description: 'Bluff transforms predictions into liquid markets where belief turns liquid and conviction gets tested. Trade markets, back your views, and claim winnings.',
    images: ['/og-image.png'],
    creator: '@bluff',
    site: '@bluff',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_VERIFICATION_ID,
  },
  themeColor: "#010101",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig,
    (await headers()).get("cookie")
  );

  return (
    <html lang="en">
      <head>
        <link rel="preload" as="image" href="/bg-image.jpeg" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/BLUFF_B_FAVICON_64x64_v2.4.4.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Bluff" />
        <meta name="application-name" content="Bluff" />
        <meta name="msapplication-TileColor" content="#010101" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
      </head>

      <body className="antialiased bg-black">
        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LMZGX9M148"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-LMZGX9M148');
          `}
        </Script>
        
        <SessionProvider
          refetchInterval={0}
          refetchOnWindowFocus={false}
          refetchWhenOffline={false}
        >
          <TooltipProvider delayDuration={0}>
            <ContextProvider initialState={initialState}>
              <HeaderModalProvider>
                <ClientLayout>
                  {/* <GrainOverlay /> */}
                  {children}
                </ClientLayout>
                <Toaster
                  position="top-center"
                  toastOptions={{
                    style: {
                      zIndex: 99999,
                      fontSize: "14px",
                    },
                  }}
                />
              </HeaderModalProvider>
            </ContextProvider>
          </TooltipProvider>
        </SessionProvider>
        <Analytics />
      </body>
    </html>
  );
}
