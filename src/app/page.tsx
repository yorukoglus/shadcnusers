"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setIsAuthenticated(false);
      router.push("/login");
      return;
    }

    fetchUserData(token);
  }, [router]);

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
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        setIsAuthenticated(false);
        router.push("/login");
      }
    } catch (error) {
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  if (isAuthenticated === null) {
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
