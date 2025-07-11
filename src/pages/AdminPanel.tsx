
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Settings, Users, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { ManagementTeamAdmin } from "@/components/ManagementTeamAdmin";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import LoginForm from "@/components/LoginForm";

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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="teams" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Management Teams
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  System Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="teams" className="mt-6">
                <ManagementTeamAdmin />
              </TabsContent>
              
              <TabsContent value="settings" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>System Settings</CardTitle>
                    <CardDescription>
                      Configure system-wide settings and preferences
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">System settings will be implemented here.</p>
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
  return (
    <AuthProvider>
      <AdminPanelContent />
    </AuthProvider>
  );
};

export default AdminPanel;
