import "@/styles/globals.css";
import { Metadata } from "next";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import ContextProvider from "@/providers/ContextProvider";
import { wagmiAdapter } from "@/config/wagmi";
import { Toaster } from "react-hot-toast";
import { SessionProvider } from "next-auth/react";
import { TooltipProvider } from "@/components/ui/tooltip-old";
import Script from "next/script";
import { HeaderModalProvider } from "@/hooks/use-header-modal";
import GamesClientLayout from "./GamesClientLayout";

export const metadata: Metadata = {
  title: "Bluff Games | Play and Win",
  description: "Play exciting games on Bluff. Test your skills and win rewards.",
  keywords: ["crypto", "games", "blackjack", "casino", "web3 gaming"],
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
    canonical: '/games',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/games',
    title: 'Bluff Games | Play and Win',
    description: 'Play exciting games on Bluff. Test your skills and win rewards.',
    siteName: 'Bluff',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Bluff Games',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Bluff Games | Play and Win',
    description: 'Play exciting games on Bluff. Test your skills and win rewards.',
    images: ['/og-image.png'],
  },
};

export default async function GamesLayout({
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
        <link rel="icon" href="/favicon.ico" />
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
                <GamesClientLayout>
                  {children}
                </GamesClientLayout>
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
      </body>
    </html>
  );
}

