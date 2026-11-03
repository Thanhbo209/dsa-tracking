import type { Metadata } from "next";
import { Alan_Sans } from "next/font/google";
import "../style/globals.css";

const alanSans = Alan_Sans({
  variable: "--font-alan-sans",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "DSA Master",
    template: "%s | DSA Master",
  },
  description:
    "Track, analyze, and master DSA problems with your personal playbook and AI analysis.",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={` ${alanSans.variable} font-sans h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
