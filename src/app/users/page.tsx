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
import EditUserModal from "./EditUserModal";

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
  const [editModalOpen, setEditModalOpen] = useState(false);
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
                <DropdownMenuItem
                  onClick={() => alert(`Sil: ${params.data.name}`)}
                >
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

  useEffect(() => {
    const fetchUsers = async () => {
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
    setEditModalOpen(true);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === updatedUser.id ? updatedUser : u))
    );
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
        <CardHeader>
          <CardTitle>Kullanıcılar ({users.length})</CardTitle>
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
      <EditUserModal
        open={editModalOpen}
        onOpenChange={(open) => {
          setEditModalOpen(open);
          if (!open) setSelectedUser(null);
        }}
        user={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
}
