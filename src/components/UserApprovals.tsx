import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserCheck, Clock, CheckCircle, XCircle, Edit, Trash2, ArrowLeft } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface RegistrationRequest {
  id: string;
  username: string;
  mobile_number: string;
  status: string;
  created_at: string;
  panchayath_id?: string;
}

const UserApprovals = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRequest, setEditingRequest] = useState<RegistrationRequest | null>(null);
  const [editForm, setEditForm] = useState({ username: '', mobile_number: '' });
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
    
    // Real-time subscription
    const channel = supabase
      .channel('user-approvals')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_registration_requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to fetch registration requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('user_registration_requests')
        .update({ 
          status: action,
          approved_by: 'admin', // You might want to get this from current admin user
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `Request ${action} successfully`,
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (request: RegistrationRequest) => {
    setEditingRequest(request);
    setEditForm({
      username: request.username,
      mobile_number: request.mobile_number
    });
  };

  const handleSaveEdit = async () => {
    if (!editingRequest) return;
    
    try {
      const { error } = await supabase
        .from('user_registration_requests')
        .update({
          username: editForm.username,
          mobile_number: editForm.mobile_number,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingRequest.id);

      if (error) throw error;
      
      setEditingRequest(null);
      toast({
        title: "Success",
        description: "Request updated successfully",
      });
    } catch (error) {
      console.error('Error updating request:', error);
      toast({
        title: "Error",
        description: "Failed to update request",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!requestToDelete) return;
    
    try {
      const { error } = await supabase
        .from('user_registration_requests')
        .delete()
        .eq('id', requestToDelete);

      if (error) throw error;
      
      setDeleteDialogOpen(false);
      setRequestToDelete(null);
      toast({
        title: "Success",
        description: "Request deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting request:', error);
      toast({
        title: "Error",
        description: "Failed to delete request",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-4">
        <Link to="/">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            User Registration Approvals
          </CardTitle>
          <CardDescription>
            Review and approve user registration requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : requests.length === 0 ? (
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
                  <TableHead>Requested Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.username}</TableCell>
                    <TableCell>{request.mobile_number}</TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell>
                      {new Date(request.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {request.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAction(request.id, 'approved')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleAction(request.id, 'rejected')}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(request)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setRequestToDelete(request.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingRequest} onOpenChange={() => setEditingRequest(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Registration Request</DialogTitle>
            <DialogDescription>
              Update the username and mobile number for this registration request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                Username
              </Label>
              <Input
                id="username"
                value={editForm.username}
                onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="mobile" className="text-right">
                Mobile Number
              </Label>
              <Input
                id="mobile"
                value={editForm.mobile_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, mobile_number: e.target.value }))}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRequest(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this registration request? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserApprovals;