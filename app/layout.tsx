import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OWM | AI Assistant Andy",
  description: "Andy the AI powered assitant helps match creators with brands.",
  icons: { icon: '/images/Andy.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <header className="border-b border-[#1e1e35] bg-[#0c0c14]/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2.5 group">
              <span className="text-sm font-semibold tracking-widest text-[#6366f1] uppercase">OWM</span>
              <span className="w-px h-4 bg-[#252540]" />
              <span className="text-sm font-medium text-[#9898b8] group-hover:text-[#f0f0ff] transition-colors">
                Home
              </span>
            </a>
            <nav className="flex items-center gap-1">
              <Link
                href="/?open=1"
                className="px-3 py-1.5 text-sm text-[#9898b8] hover:text-[#f0f0ff] transition-colors rounded-md hover:bg-[#1a1a2e]"
              >
                New Match
              </Link>
              <span className="w-px h-4 bg-[#252540] mx-1" />
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-sm text-[#9898b8] hover:text-[#f0f0ff] transition-colors rounded-md hover:bg-[#1a1a2e]"
              >
                Dashboard
              </Link>
            </nav>
          </div>
        </header>

        <main className="min-h-[calc(100vh-56px)]">
          {children}
        </main>
      </body>
    </html>
  );
}
