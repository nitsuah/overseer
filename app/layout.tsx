import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { auth, signOut } from "@/auth";

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
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600" />
                <h1 className="text-xl font-bold">Overseer</h1>
              </div>
              <div className="flex items-center gap-4">
                {session?.user && (
                  <>
                    <div className="flex items-center gap-2">
                      {session.user.image && (
                        <img
                          src={session.user.image}
                          alt={session.user.name || 'User'}
                          className="h-8 w-8 rounded-full"
                        />
                      )}
                      <span className="text-sm text-slate-300">{session.user.name}</span>
                    </div>
                    <form
                      action={async () => {
                        "use server"
                        await signOut({ redirectTo: '/login' })
                      }}
                    >
                      <button
                        type="submit"
                        className="text-sm text-slate-400 hover:text-white transition-colors"
                      >
                        Sign out
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>
        <main className="container mx-auto px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
