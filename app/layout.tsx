import { GeistSans } from "geist/font/sans";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";
import { Toaster } from "@/components/ui/toaster";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head />
      <body className={`antialiased`}>
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
      </body>
    </html>
  );
}
