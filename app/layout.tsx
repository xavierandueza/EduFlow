import { GeistSans } from "geist/font/sans";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import TopNav, { topNavHeight } from "@/app/ui/navigation/TopNav";
import Footer from "@/app/ui/Footer";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <head />
      <body className={`antialiased`}>
        <TopNav />
        <SessionProvider>{children}</SessionProvider>
        <Toaster />
        <Footer />
      </body>
    </html>
  );
}
