"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider, useAuth } from "@/lib/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

function Header() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full bg-white shadow mb-8">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        <span className="font-bold text-xl">ShadcnUsers</span>
        <div className="space-x-4">
          {!isAuthenticated ? (
            <>
              <a href="/register" className="text-gray-700 hover:underline">
                Kayıt
              </a>
              <a href="/login" className="text-gray-700 hover:underline">
                Giriş
              </a>
            </>
          ) : (
            <>
              <a href="/profile" className="text-gray-700 hover:underline">
                Profil
              </a>
              <button
                onClick={logout}
                className="text-gray-700 hover:underline bg-transparent border-none cursor-pointer"
              >
                Çıkış
              </button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
