"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const schema = z.object({
  name: z.string().min(2, "Ad en az 2 karakter olmalı"),
  email: z.string().email("Geçerli bir email girin"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı").optional(),
});

type FormData = z.infer<typeof schema>;

export default function ProfilePage() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "" },
  });

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
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        form.reset({
          name: data.user.name,
          email: data.user.email,
          password: "",
        });
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsAuthenticated(false);
        router.push("/login");
      }
    } catch (error) {
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);

    const token = localStorage.getItem("token");
    if (!token) {
      setResult("Oturum süresi dolmuş. Lütfen tekrar giriş yapın.");
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setResult("Profil başarıyla güncellendi!");
        setUserData(result.user);
        form.reset({ ...data, password: "" });
      } else {
        setResult(result.error || "Güncelleme sırasında bir hata oluştu");
      }
    } catch (error) {
      setResult("Sunucu hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  }

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
        <h2 className="text-2xl font-bold mb-6 text-center">Profil Düzenle</h2>
        {userData && (
          <div className="mb-4 p-3 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              Kayıt Tarihi:{" "}
              {new Date(userData.createdAt).toLocaleDateString("tr-TR")}
            </p>
          </div>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ad</FormLabel>
                  <FormControl>
                    <Input placeholder="Adınızı girin" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Yeni Şifre</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Yeni Şifre (opsiyonel)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Güncelleniyor..." : "Profili Güncelle"}
            </Button>
            {result && (
              <div
                className={
                  result.includes("başarıyla")
                    ? "text-green-600 text-center mt-2"
                    : "text-red-600 text-center mt-2"
                }
              >
                {result}
              </div>
            )}
          </form>
        </Form>
      </Card>
    </div>
  );
}
