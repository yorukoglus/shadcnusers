"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export default function HomePage() {
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();
  const { isAuthenticated, isMounted } = useAuth();

  useEffect(() => {
    if (!isMounted) return;

    if (isAuthenticated === false) {
      router.push("/login");
      return;
    }

    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      if (token) {
        fetchUserData(token);
      }
    }
  }, [isAuthenticated, isMounted, router]); //eslint-disable-line

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch("/api/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
      } else {
        localStorage.removeItem("token");
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  if (!isMounted || isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Yükleniyor...
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Hoş Geldiniz!</h1>
        {userData && (
          <div className="mb-6 p-4 bg-gray-100 rounded">
            <h3 className="font-semibold mb-2">Kullanıcı Bilgileri:</h3>
            <p>
              <strong>Ad:</strong> {userData.name}
            </p>
            <p>
              <strong>Email:</strong> {userData.email}
            </p>
            <p>
              <strong>Kayıt Tarihi:</strong>{" "}
              {new Date(userData.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        )}
        <p className="text-gray-600 mb-6 text-center">
          Başarıyla giriş yaptınız. Bu anasayfada kullanıcı bilgilerinizi
          görebilir ve yönetebilirsiniz.
        </p>
        <div className="space-y-4">
          <Button onClick={() => router.push("/profile")} className="w-full">
            Profili Düzenle
          </Button>
        </div>
      </Card>
    </div>
  );
}
