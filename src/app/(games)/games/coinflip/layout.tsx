import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BluffBets Coinflip",
  description: "Play Coinflip with Web3 Integration",
};

export const viewport: Viewport = {
  themeColor: "#000000",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
