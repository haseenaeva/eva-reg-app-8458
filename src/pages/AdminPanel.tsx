
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Users, LogOut, MapPin, UserCheck, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { TeamManagementNew } from "@/components/TeamManagementNew";
import { AddPanchayathForm } from "@/components/AddPanchayathForm";
import { useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";
import { AdminApprovalPanel } from "@/components/AdminApprovalPanel";
import { UserManagement } from "@/components/UserManagement";
import { AdminPermissionsManager } from "@/components/AdminPermissionsManager";

const AdminPanelContent = () => {
  const { user, logout } = useAuth();

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="font-medium">{user.username} ({user.role.replace('_', ' ')})</p>
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Settings className="h-8 w-8 text-blue-600" />
            Admin Panel
          </h1>
          <p className="text-gray-600">Manage system settings and configurations</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="teams" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Management Teams
                </TabsTrigger>
                <TabsTrigger value="panchayaths" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Panchayaths
                </TabsTrigger>
                <TabsTrigger value="approvals" className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Guest Approvals
                </TabsTrigger>
                <TabsTrigger value="permissions" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Permissions
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="teams" className="mt-6">
                <TeamManagementNew />
              </TabsContent>
              
              <TabsContent value="panchayaths" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Panchayath Management</CardTitle>
                    <CardDescription>
                      Add and manage panchayaths in the system
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <AddPanchayathForm />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="approvals" className="mt-6">
                <AdminApprovalPanel />
              </TabsContent>
              
              <TabsContent value="permissions" className="mt-6">
                <AdminPermissionsManager />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Create and manage team management users with access permissions
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <UserManagement />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  return <AdminPanelContent />;
};

export default AdminPanel;
