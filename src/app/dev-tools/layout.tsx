import "@/styles/globals.css";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Development Tools | Bluff",
  description: "Internal development tools and utilities",
};

export default function DevToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="antialiased bg-background">
        {children}
      </body>
    </html>
  );
}

