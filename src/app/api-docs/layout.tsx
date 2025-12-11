import "@/styles/globals.css";
import { Metadata } from "next";
import { SessionWrapper } from "./components/SessionWrapper";

export const metadata: Metadata = {
  title: "API Documentation & Testing | Bluff",
  description: "Interactive API documentation and testing interface",
};

export default function ApiDocsLayout({
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
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}

