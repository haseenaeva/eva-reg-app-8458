import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, Settings } from "lucide-react";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";
import { PermissionsManager } from "./PermissionsManager";

interface AdminUser {
  id: string;
  username: string;
  role: string;
  created_at: string;
  is_active?: boolean;
}

export const AdminPermissionsManager = () => {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.USER_PROFILES)
        .select('*')
        .in('role', ['admin', 'local_admin', 'super_admin'])
        .order('username');
        
      if (error) throw error;
      setAdminUsers(data || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admin users",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleManagePermissions = (user: AdminUser) => {
    setSelectedUser(user);
    setIsPermissionsOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'super_admin':
        return <Badge variant="destructive">SUPER ADMIN</Badge>;
      case 'local_admin':
        return <Badge variant="secondary">LOCAL ADMIN</Badge>;
      case 'admin':
        return <Badge variant="outline">USER ADMIN</Badge>;
      default:
        return <Badge variant="outline">{role.toUpperCase()}</Badge>;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Admin Permissions Management
              </CardTitle>
              <CardDescription>
                Assign specific permissions to admin users. Super admins automatically have all permissions.
              </CardDescription>
            </div>
            <Button>
              <Shield className="mr-2 h-4 w-4" />
              Assign Permissions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h4 className="text-lg font-semibold">Current Admin Users</h4>
          </div>

          {adminUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No admin users found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {adminUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {getRoleBadge(user.role)}
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleManagePermissions(user)}
                        className="flex items-center gap-2"
                      >
                        <Settings className="h-4 w-4" />
                        Manage Permissions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <PermissionsManager
          isOpen={isPermissionsOpen}
          onClose={() => {
            setIsPermissionsOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser}
        />
      )}
    </>
  );
};