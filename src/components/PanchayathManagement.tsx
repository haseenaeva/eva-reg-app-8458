import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Building2, Plus, Edit, Trash2 } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Panchayath {
  id: string;
  name: string;
  district: string;
  state: string;
  created_at: string;
}

const PanchayathManagement = () => {
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPanchayath, setEditingPanchayath] = useState<Panchayath | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    state: '',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchPanchayaths();
  }, []);

  const fetchPanchayaths = async () => {
    try {
      const { data, error } = await supabase
        .from('panchayaths')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPanchayaths(data || []);
    } catch (error) {
      console.error('Error fetching panchayaths:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPanchayath) {
        // Update panchayath
        const { error } = await supabase
          .from('panchayaths')
          .update({
            name: formData.name,
            district: formData.district,
            state: formData.state,
          })
          .eq('id', editingPanchayath.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Panchayath updated successfully",
        });
      } else {
        // Create new panchayath
        const { error } = await supabase
          .from('panchayaths')
          .insert([{
            name: formData.name,
            district: formData.district,
            state: formData.state,
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Panchayath created successfully",
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchPanchayaths();
    } catch (error) {
      console.error('Error saving panchayath:', error);
      toast({
        title: "Error",
        description: "Failed to save panchayath",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (panchayathId: string) => {
    if (!confirm('Are you sure you want to delete this panchayath?')) return;

    try {
      const { error } = await supabase
        .from('panchayaths')
        .delete()
        .eq('id', panchayathId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Panchayath deleted successfully",
      });
      
      fetchPanchayaths();
    } catch (error) {
      console.error('Error deleting panchayath:', error);
      toast({
        title: "Error",
        description: "Failed to delete panchayath",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      district: '',
      state: '',
    });
    setEditingPanchayath(null);
  };

  const handleEdit = (panchayath: Panchayath) => {
    setEditingPanchayath(panchayath);
    setFormData({
      name: panchayath.name,
      district: panchayath.district,
      state: panchayath.state,
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Panchayath Management
              </CardTitle>
              <CardDescription>
                Manage panchayaths and their details
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Panchayath
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : panchayaths.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No panchayaths found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>District</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {panchayaths.map((panchayath) => (
                  <TableRow key={panchayath.id}>
                    <TableCell className="font-medium">{panchayath.name}</TableCell>
                    <TableCell>{panchayath.district}</TableCell>
                    <TableCell>{panchayath.state}</TableCell>
                    <TableCell>
                      {new Date(panchayath.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(panchayath)}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(panchayath.id)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPanchayath ? 'Edit Panchayath' : 'Create New Panchayath'}
            </DialogTitle>
            <DialogDescription>
              {editingPanchayath ? 'Update panchayath information' : 'Add a new panchayath to the system'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Panchayath Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                required
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingPanchayath ? 'Update' : 'Create'} Panchayath
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PanchayathManagement;