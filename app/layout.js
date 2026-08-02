import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NextAuthSessionProvider from "@/components/SessionProvider";
import { DataProvider } from "@/lib/DataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Storify | Fun and productive journalling",
  description: "Create a productive journalling environment with Storify, where each journal helps track your habits and frame your life in a story- Because your life is YOUR story.",
  verification: {
    google: "AE3-o2pDINIIQszbPW_Mt9Enps020dlSrb_jn8JNYI4"
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextAuthSessionProvider>
          <DataProvider>
            <main>{children}</main>
          </DataProvider>
        </NextAuthSessionProvider>
      </body>
    </html>
  );
}
