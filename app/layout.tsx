import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Overseer - Meta-Repository Intelligence Layer",
  description: "A unified dashboard for managing all your GitHub repositories",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        <SessionProvider session={session}>
          <main className="w-full">{children}</main>
        </SessionProvider>
      </body>
    </html>
  );
}
