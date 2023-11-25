import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata = {
  title: "EduFlow - Practice",
  description: "Practice Skill - powered by EduFlow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={GeistSans.variable}>
      <body>{children}</body>
    </html>
  );
}
