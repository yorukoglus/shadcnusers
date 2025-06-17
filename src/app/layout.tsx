"use client";
import "./globals.css";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { usePathname, useRouter } from "next/navigation";

function Header() {
  const { isAuthenticated, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const linkClass = (path: string) => {
    const baseClass =
      "cursor-pointer px-3 py-2 rounded-md text-sm font-medium transition-colors";
    return pathname === path
      ? `${baseClass} bg-blue-100 text-blue-700`
      : `${baseClass} text-gray-700 hover:text-blue-600 hover:bg-gray-50`;
  };

  return (
    <header className="w-full bg-white shadow mb-8">
      <nav className="container mx-auto flex items-center justify-between py-4 px-4">
        <div className="flex items-center space-x-6">
          <a className={linkClass("/")} onClick={() => router.push("/")}>
            <span className="font-bold text-xl">ShadcnUsers</span>
          </a>
        </div>
        <div className="flex items-center space-x-2">
          {!isAuthenticated ? (
            <>
              <a
                className={linkClass("/register")}
                onClick={() => router.push("/register")}
              >
                Kayıt
              </a>
              <a
                className={linkClass("/login")}
                onClick={() => router.push("/login")}
              >
                Giriş
              </a>
            </>
          ) : (
            <>
              <a
                className={linkClass("/users")}
                onClick={() => router.push("/users")}
              >
                Kullanıcılar
              </a>
              <a
                className={linkClass("/profile")}
                onClick={() => router.push("/profile")}
              >
                Profil
              </a>
              <a
                onClick={logout}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-colors bg-transparent border-none cursor-pointer"
              >
                Çıkış
              </a>
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
      <body className="antialiased">
        <AuthProvider>
          <Header />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
