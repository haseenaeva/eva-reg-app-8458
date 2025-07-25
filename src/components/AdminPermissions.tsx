import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const AdminPermissions = () => {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Admin Permissions
          </CardTitle>
          <CardDescription>
            Manage admin permissions and access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            Permission management features coming soon
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPermissions;