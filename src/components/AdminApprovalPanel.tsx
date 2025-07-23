import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Check, X, Clock, Phone, User, Edit, Trash2 } from "lucide-react";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "./AuthProvider";

interface RegistrationRequest {
  id: string;
  username: string;
  mobile_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  approved_by?: string;
}

export const AdminApprovalPanel = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    request: RegistrationRequest | null;
    action: 'approve' | 'reject' | 'delete';
  }>({ open: false, request: null, action: 'approve' });
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    request: RegistrationRequest | null;
  }>({ open: false, request: null });
  const [editForm, setEditForm] = useState({ username: '', mobile_number: '' });
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.USER_REGISTRATION_REQUESTS)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as RegistrationRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registration requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approve' | 'reject' | 'delete') => {
    try {
      if (action === 'delete') {
        const { error } = await typedSupabase
          .from(TABLES.USER_REGISTRATION_REQUESTS)
          .delete()
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: "Success",
          description: "Request deleted successfully",
        });
      } else {
        const newStatus = action === 'approve' ? 'approved' : 'rejected';
        
        const { error } = await typedSupabase
          .from(TABLES.USER_REGISTRATION_REQUESTS)
          .update({
            status: newStatus,
            approved_by: user?.username || 'admin'
          })
          .eq('id', requestId);

        if (error) throw error;

        toast({
          title: "Success",
          description: `Request ${action}d successfully`,
        });
      }

      fetchRequests(); // Refresh the list
      setActionDialog({ open: false, request: null, action: 'approve' });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} request`,
        variant: "destructive"
      });
    }
  };

  const handleEdit = async () => {
    if (!editDialog.request) return;

    try {
      const { error } = await typedSupabase
        .from(TABLES.USER_REGISTRATION_REQUESTS)
        .update({
          username: editForm.username,
          mobile_number: editForm.mobile_number
        })
        .eq('id', editDialog.request.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Request updated successfully",
      });

      fetchRequests();
      setEditDialog({ open: false, request: null });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (request: RegistrationRequest) => {
    setEditForm({
      username: request.username,
      mobile_number: request.mobile_number
    });
    setEditDialog({ open: true, request });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
          <Check className="w-3 h-3 mr-1" />
          Approved
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200">
          <X className="w-3 h-3 mr-1" />
          Rejected
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
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
          <CardTitle>Guest Registration Requests</CardTitle>
          <CardDescription>
            Review and approve or reject guest access requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No registration requests found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Mobile Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Requested</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        {request.username}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {request.mobile_number}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 border-green-200 hover:bg-green-50"
                              onClick={() => setActionDialog({
                                open: true,
                                request,
                                action: 'approve'
                              })}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setActionDialog({
                                open: true,
                                request,
                                action: 'reject'
                              })}
                            >
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {user?.role === 'super_admin' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-blue-600 border-blue-200 hover:bg-blue-50"
                              onClick={() => openEditDialog(request)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-200 hover:bg-red-50"
                              onClick={() => setActionDialog({
                                open: true,
                                request,
                                action: 'delete'
                              })}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => 
        setActionDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'approve' ? 'Approve' : 
               actionDialog.action === 'reject' ? 'Reject' : 'Delete'} Registration
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {actionDialog.action} the registration request for{' '}
              <strong>{actionDialog.request?.username}</strong>?
              {actionDialog.action === 'delete' && (
                <span className="text-red-600 block mt-2">
                  This action cannot be undone.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setActionDialog({ open: false, request: null, action: 'approve' })}
            >
              Cancel
            </Button>
            <Button
              variant={actionDialog.action === 'approve' ? 'default' : 'destructive'}
              onClick={() => {
                if (actionDialog.request) {
                  handleAction(actionDialog.request.id, actionDialog.action);
                }
              }}
            >
              {actionDialog.action === 'approve' ? 'Approve' : 
               actionDialog.action === 'reject' ? 'Reject' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialog.open} onOpenChange={(open) => 
        setEditDialog(prev => ({ ...prev, open }))
      }>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Registration Request</DialogTitle>
            <DialogDescription>
              Update the registration details for this request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-username">Username</Label>
              <Input
                id="edit-username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="edit-mobile">Mobile Number</Label>
              <Input
                id="edit-mobile"
                value={editForm.mobile_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                placeholder="Enter mobile number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialog({ open: false, request: null })}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};