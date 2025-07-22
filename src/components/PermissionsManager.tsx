import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

interface Permission {
  id: string;
  module: string;
  description: string;
  read: boolean;
  write: boolean;
  delete: boolean;
}

interface PermissionsManagerProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    role: string;
  };
}

export const PermissionsManager: React.FC<PermissionsManagerProps> = ({
  isOpen,
  onClose,
  user
}) => {
  const [selectedAdminUser, setSelectedAdminUser] = useState(user.username);
  const [permissions, setPermissions] = useState<Permission[]>([
    {
      id: '1',
      module: 'Accounts Management',
      description: 'Manage cash transactions and expenses',
      read: false,
      write: false,
      delete: false
    },
    {
      id: '2',
      module: 'Registrations',
      description: 'Manage user registrations and applications',
      read: false,
      write: false,
      delete: false
    },
    {
      id: '3',
      module: 'Categories',
      description: 'Manage service categories',
      read: false,
      write: false,
      delete: false
    },
    {
      id: '4',
      module: 'Team Management',
      description: 'Manage teams and team members',
      read: false,
      write: false,
      delete: false
    },
    {
      id: '5',
      module: 'Task Management',
      description: 'Manage and assign tasks',
      read: false,
      write: false,
      delete: false
    },
    {
      id: '6',
      module: 'Panchayaths',
      description: 'Manage panchayath information',
      read: false,
      write: false,
      delete: false
    }
  ]);

  const { toast } = useToast();

  const handlePermissionChange = (permissionId: string, type: 'read' | 'write' | 'delete', checked: boolean) => {
    setPermissions(permissions.map(permission =>
      permission.id === permissionId
        ? { ...permission, [type]: checked }
        : permission
    ));
  };

  const handleSave = async () => {
    try {
      // Here you would save the permissions to your database
      // For now, we'll just show a success message
      
      toast({
        title: "Success",
        description: "Permissions updated successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Error saving permissions:', error);
      toast({
        title: "Error",
        description: "Failed to save permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>🛡️</span>
            Assign Admin Permissions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="admin-user">Select Admin User</Label>
            <Select value={selectedAdminUser} onValueChange={setSelectedAdminUser}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={user.username}>
                  {user.username} ({user.role.replace('_', ' ').toUpperCase()})
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Module Permissions</h4>
            <div className="space-y-4">
              {permissions.map((permission) => (
                <div key={permission.id} className="border rounded-lg p-4 space-y-3">
                  <div>
                    <h5 className="font-medium text-base">{permission.module}</h5>
                    <p className="text-sm text-muted-foreground">{permission.description}</p>
                  </div>
                  
                  <div className="flex gap-6">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${permission.id}-read`}
                        checked={permission.read}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'read', checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`${permission.id}-read`}
                        className="text-sm font-normal"
                      >
                        Read
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${permission.id}-write`}
                        checked={permission.write}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'write', checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`${permission.id}-write`}
                        className="text-sm font-normal"
                      >
                        Write
                      </Label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`${permission.id}-delete`}
                        checked={permission.delete}
                        onCheckedChange={(checked) => 
                          handlePermissionChange(permission.id, 'delete', checked as boolean)
                        }
                      />
                      <Label 
                        htmlFor={`${permission.id}-delete`}
                        className="text-sm font-normal"
                      >
                        Delete
                      </Label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Permissions
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};