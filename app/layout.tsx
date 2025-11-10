import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import TopBar from "./components/TopBar";
import Providers from "./_providers";
import AuthModal from "./components/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dusbullion.com — Buy Gold Bars",
  description: "Buy gold bars with live pricing.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-neutral-50 text-neutral-900 antialiased">
        <Providers>
          <Header />
          <AuthModal />
          <main className="mx-auto max-w-7xl px-4 pb-20 pt-8">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
