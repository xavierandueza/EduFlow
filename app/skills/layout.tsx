import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "EduFlow - Skills",
  description: "Skills - powered by EduFlow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
