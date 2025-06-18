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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const schema = z
  .object({
    name: z.string().min(2, "Ad en az 2 karakter olmalı"),
    email: z.string().email("Geçerli bir email girin"),
    password: z
      .string()
      .min(6, "Şifre en az 6 karakter olmalı")
      .regex(/[A-Z]/, "Şifre en az bir büyük harf içermeli")
      .regex(/[0-9]/, "Şifre en az bir rakam içermeli"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Şifreler eşleşmiyor",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { setIsAuthenticated } = useAuth();
  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormData) {
    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        localStorage.setItem("token", result.token);
        setIsAuthenticated(true);
        setResult("Kayıt başarılı! Ana sayfaya yönlendiriliyorsunuz...");
        form.reset();
        setTimeout(() => {
          router.push("/");
        }, 100);
      } else {
        setResult(result.error || "Kayıt sırasında bir hata oluştu");
      }
    } catch {
      setResult("Sunucu hatası oluştu");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Kayıt Ol</h2>
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
                  <FormLabel>Şifre</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Şifre" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Şifre Tekrar</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Şifre Tekrar"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Kayıt Olunuyor..." : "Kayıt Ol"}
            </Button>
            {result && (
              <div
                className={
                  result.includes("başarılı")
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
