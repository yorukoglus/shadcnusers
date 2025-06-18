import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

interface UserModalProps {
  open: "add" | "edit" | undefined;
  onOpenChange: (open: "add" | "edit" | undefined) => void;
  user?: User | null;
  onUserAdded?: (user: User) => void;
  onUserUpdated?: (user: User) => void;
}

export default function UserModal({
  open,
  onOpenChange,
  user,
  onUserAdded,
  onUserUpdated,
}: UserModalProps) {
  const mode = open;
  const [form, setForm] = useState({
    name: "",
    email: "",
    role: "user",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (mode === "edit" && user) {
      setForm({
        name: user.name,
        email: user.email,
        role: user.role,
        password: "",
      });
    } else if (mode === "add") {
      setForm({ name: "", email: "", role: "user", password: "" });
    }
  }, [mode, user, open]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (mode === "add") {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form),
        });
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data?.error || "Kullanıcı eklenemedi");
        }
        const newUser = await response.json();
        onUserAdded && onUserAdded(newUser);
        toast.success("Kullanıcı başarıyla eklendi");
        onOpenChange(undefined);
      } else if (mode === "edit" && user) {
        const response = await fetch("/api/users", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: user.id,
            name: form.name,
            email: form.email,
            role: form.role,
          }),
        });
        if (!response.ok) {
          throw new Error("Kullanıcı güncellenemedi");
        }
        const updatedUser: User = {
          ...user,
          name: form.name,
          email: form.email,
          role: form.role,
          updatedAt: new Date().toISOString(),
        };
        onUserUpdated && onUserUpdated(updatedUser);
        toast.success("Kullanıcı başarıyla güncellendi");
        onOpenChange(undefined);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={!!mode} onOpenChange={() => onOpenChange(undefined)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Yeni Kullanıcı Ekle" : "Kullanıcıyı Düzenle"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>
          {mode === "add" && (
            <div>
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(undefined)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? mode === "add"
                  ? "Ekleniyor..."
                  : "Kaydediliyor..."
                : mode === "add"
                ? "Ekle"
                : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
