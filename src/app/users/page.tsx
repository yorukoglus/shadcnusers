"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AgGridReact } from "ag-grid-react";
import {
  ColDef,
  GridReadyEvent,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import { useAuth } from "@/lib/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import UserModal from "./UserModal";
import { toast } from "sonner";

ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const { role: myRole } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userModalOpen, setUserModalOpen] = useState<
    "add" | "edit" | undefined
  >();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const formatDate = (params: { value: string }) => {
    return new Date(params.value).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columnDefs: ColDef[] = useMemo(() => {
    const baseColumns = [
      {
        field: "name",
        headerName: "Ad Soyad",
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
      },
      {
        field: "email",
        headerName: "E-posta",
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
      },
      {
        field: "role",
        headerName: "Rol",
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        cellRenderer: (params: any) => {
          return (
            <Badge variant={params.value === "admin" ? "default" : "secondary"}>
              {params.value}
            </Badge>
          );
        },
        cellClass: myRole === "admin" ? "bg-gray-100" : "",
        editable: myRole === "admin",
        cellEditor: myRole === "admin" ? "agSelectCellEditor" : undefined,
        cellEditorParams:
          myRole === "admin" ? { values: ["user", "admin"] } : undefined,
      },
      {
        field: "createdAt",
        headerName: "Kayıt Tarihi",
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        valueFormatter: formatDate,
      },
      {
        field: "updatedAt",
        headerName: "Son Güncelleme",
        sortable: true,
        filter: true,
        resizable: true,
        flex: 1,
        valueFormatter: formatDate,
      },
    ];
    if (myRole === "admin") {
      baseColumns.push({
        headerName: "",
        field: "actions",
        flex: 0.3,
        cellRenderer: (params: any) => {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleEditClick(params.data)}>
                  Düzenle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleDeleteUser(params.data)}>
                  Sil
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        sortable: false,
        filter: false,
        resizable: false,
        cellClass: "",
        editable: false,
        cellEditor: undefined,
        cellEditorParams: undefined,
      });
    }
    return baseColumns;
  }, [myRole]);

  const defaultColDef = useMemo(
    () => ({ sortable: true, filter: true, resizable: true }),
    []
  );

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/users");
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    params.api.sizeColumnsToFit();
  };

  const onCellValueChanged = async (params: any) => {
    if (params.colDef.field === "role" && myRole === "admin") {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("/api/users", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            userId: params.data.id,
            role: params.data.role,
          }),
        });
        if (!response.ok) {
          throw new Error("Rol güncellenemedi");
        }
      } catch (err) {
        alert(
          "Rol güncellenemedi: " + (err instanceof Error ? err.message : "")
        );
      }
    }
  };

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setUserModalOpen("edit");
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
  };

  const handleDeleteUser = async (user: User) => {
    if (
      !window.confirm(
        `${user.name} kullanıcısını silmek istediğinize emin misiniz?`
      )
    )
      return;
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/users", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId: user.id }),
      });
      if (!response.ok) {
        throw new Error("Kullanıcı silinemedi");
      }
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("Kullanıcı başarıyla silindi");
    } catch (err) {
      toast.error(
        "Kullanıcı silinemedi: " + (err instanceof Error ? err.message : "")
      );
    }
  };

  const handleUserAdded = () => {
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">Yükleniyor...</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-8">
              <div className="text-red-500">Hata: {error}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Kullanıcılar ({users.length})</CardTitle>
          {myRole === "admin" && (
            <Button
              onClick={() => {
                setUserModalOpen("add");
                setSelectedUser(null);
              }}
            >
              + Kullanıcı Ekle
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="text-muted-foreground">
                Henüz kullanıcı bulunmuyor.
              </div>
            </div>
          ) : (
            <div className="ag-theme-quartz w-full h-96">
              <AgGridReact
                rowData={users}
                columnDefs={columnDefs}
                defaultColDef={defaultColDef}
                onGridReady={onGridReady}
                onCellValueChanged={onCellValueChanged}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[5, 10, 20, 50]}
                animateRows={true}
                domLayout="autoHeight"
              />
            </div>
          )}
        </CardContent>
      </Card>
      <UserModal
        open={userModalOpen}
        onOpenChange={(open) => {
          setUserModalOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={userModalOpen === "edit" ? selectedUser : null}
        onUserAdded={handleUserAdded}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
