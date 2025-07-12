
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageSquare, Plus, RefreshCw, Building } from "lucide-react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Panchayath {
  id: string;
  name: string;
  district: string;
  state: string;
}

interface PanchayathNote {
  id: string;
  panchayath_id: string;
  note: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface PanchayathDetailsProps {
  panchayath: Panchayath;
}

export const PanchayathDetails = ({ panchayath }: PanchayathDetailsProps) => {
  const [notes, setNotes] = useState<PanchayathNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('panchayath_notes')
        .select('*')
        .eq('panchayath_id', panchayath.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notes",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [panchayath.id]);

  const addNote = async () => {
    if (!newNote.trim() || !createdBy.trim()) {
      toast({
        title: "Error",
        description: "Please enter a note and provide your name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('panchayath_notes')
        .insert([{
          panchayath_id: panchayath.id,
          note: newNote,
          created_by: createdBy
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Note added successfully",
      });

      setNewNote('');
      setCreatedBy('');
      setDialogOpen(false);
      fetchNotes();
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Panchayath Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            {panchayath.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>District</Label>
              <p className="text-lg font-medium">{panchayath.district}</p>
            </div>
            <div>
              <Label>State</Label>
              <p className="text-lg font-medium">{panchayath.state}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Notes ({notes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add New Note
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Note</DialogTitle>
                    <DialogDescription>
                      Add a note about {panchayath.name} status or updates
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="createdBy">Your Name</Label>
                      <Input
                        id="createdBy"
                        value={createdBy}
                        onChange={(e) => setCreatedBy(e.target.value)}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="note">Note</Label>
                      <Textarea
                        id="note"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="Enter your note about panchayath status or updates"
                        rows={4}
                        required
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={addNote} disabled={loading}>
                      {loading ? "Adding..." : "Add Note"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchNotes}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {notes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No notes found for this panchayath.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {notes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-xs text-gray-500">
                      By {note.created_by} • {format(new Date(note.created_at), 'PPP p')}
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{note.note}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
