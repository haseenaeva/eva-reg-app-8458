import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trash2, Edit, Plus, Users } from "lucide-react";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";

interface Team {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

export const TeamManagementNew = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  
  const { toast } = useToast();

  const fetchTeams = async () => {
    try {
      const { data, error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .select('*')
        .order('name');
        
      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Team name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTeam) {
        const { error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .update({
            name: formData.name,
            description: formData.description
          })
          .eq('id', editingTeam.id);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team updated successfully",
        });
      } else {
        const { error } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAMS)
          .insert([{
            name: formData.name,
            description: formData.description
          }]);

        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Team created successfully",
        });
      }

      resetForm();
      fetchTeams();
    } catch (error) {
      console.error('Error saving team:', error);
      toast({
        title: "Error",
        description: "Failed to save team",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      const { error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Team deleted successfully",
      });
      
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '' });
    setEditingTeam(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      description: team.description || ''
    });
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6" />
          Team Management
        </h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingTeam(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingTeam ? 'Edit Team' : 'Create New Team'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Team Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter team description"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingTeam ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id}>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{team.name}</span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(team.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{team.description}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Created: {new Date(team.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        ))}
        
        {teams.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground">No teams created yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};