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

interface EditUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onUserUpdated: (user: User) => void;
}

export default function EditUserModal({
  open,
  onOpenChange,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    role: "user",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name, email: user.email, role: user.role });
    }
  }, [user]);

  const handleEditFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setEditLoading(true);
    setEditError(null);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: user.id,
          name: editForm.name,
          email: editForm.email,
          role: editForm.role,
        }),
      });
      if (!response.ok) {
        throw new Error("Kullanıcı güncellenemedi");
      }
      const updatedUser: User = {
        ...user,
        name: editForm.name,
        email: editForm.email,
        role: editForm.role,
        updatedAt: new Date().toISOString(),
      };
      onUserUpdated(updatedUser);
      toast.success("Kullanıcı başarıyla güncellendi");
      onOpenChange(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Kullanıcıyı Düzenle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleEditSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              name="name"
              value={editForm.name}
              onChange={handleEditFormChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="email">E-posta</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={editForm.email}
              onChange={handleEditFormChange}
              required
            />
          </div>
          <div>
            <Label htmlFor="role">Rol</Label>
            <select
              id="role"
              name="role"
              value={editForm.role}
              onChange={handleEditFormChange}
              className="w-full border rounded px-2 py-1"
              required
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>
          </div>
          {editError && <div className="text-red-500 text-sm">{editError}</div>}
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              İptal
            </Button>
            <Button type="submit" disabled={editLoading}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
