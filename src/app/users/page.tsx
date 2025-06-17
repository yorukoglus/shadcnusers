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

ModuleRegistry.registerModules([AllCommunityModule]);

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (params: { value: string }) => {
    return new Date(params.value).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const columnDefs: ColDef[] = useMemo(
    () => [
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
    ],
    []
  );

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
    </div>
  );
}
