
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Plus, RefreshCw, Search } from "lucide-react";
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

export const PanchayathNotes = () => {
  const [panchayaths, setPanchayaths] = useState<Panchayath[]>([]);
  const [notes, setNotes] = useState<PanchayathNote[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<PanchayathNote[]>([]);
  const [selectedPanchayath, setSelectedPanchayath] = useState<string>('');
  const [newNote, setNewNote] = useState('');
  const [createdBy, setCreatedBy] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const fetchPanchayaths = async () => {
    try {
      const { data, error } = await supabase
        .from('panchayaths')
        .select('*')
        .order('name');

      if (error) throw error;
      setPanchayaths(data || []);
    } catch (error) {
      console.error('Error fetching panchayaths:', error);
      toast({
        title: "Error",
        description: "Failed to fetch panchayaths",
        variant: "destructive",
      });
    }
  };

  const fetchNotes = async (panchayathId?: string) => {
    try {
      let query = supabase
        .from('panchayath_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (panchayathId && panchayathId !== 'all') {
        query = query.eq('panchayath_id', panchayathId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setNotes(data || []);
      setFilteredNotes(data || []);
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
    fetchPanchayaths();
    fetchNotes();
  }, []);

  useEffect(() => {
    fetchNotes(selectedPanchayath);
  }, [selectedPanchayath]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = notes.filter(note => 
        note.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.created_by.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getPanchayathName(note.panchayath_id).toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredNotes(filtered);
    } else {
      setFilteredNotes(notes);
    }
  }, [searchTerm, notes]);

  const addNote = async () => {
    if (!selectedPanchayath || selectedPanchayath === 'all' || !newNote.trim() || !createdBy.trim()) {
      toast({
        title: "Error",
        description: "Please select a panchayath, enter a note, and provide your name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('panchayath_notes')
        .insert([{
          panchayath_id: selectedPanchayath,
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
      fetchNotes(selectedPanchayath);
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

  const getPanchayathName = (panchayathId: string) => {
    const panchayath = panchayaths.find(p => p.id === panchayathId);
    return panchayath ? `${panchayath.name}, ${panchayath.district}` : 'Unknown Panchayath';
  };

  return (
    <div className="space-y-6">
      {/* Add New Note Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add New Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="panchayath">Select Panchayath</Label>
            <Select value={selectedPanchayath} onValueChange={setSelectedPanchayath}>
              <SelectTrigger>
                <SelectValue placeholder="Select a panchayath" />
              </SelectTrigger>
              <SelectContent>
                {panchayaths.map((panchayath) => (
                  <SelectItem key={panchayath.id} value={panchayath.id}>
                    {panchayath.name} - {panchayath.district}, {panchayath.state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

          <Button onClick={addNote} disabled={loading} className="w-full">
            {loading ? "Adding..." : "Add Note"}
          </Button>
        </CardContent>
      </Card>

      {/* Notes List */}
      <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Recent Notes ({filteredNotes.length})
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-48"
                />
              </div>
              <Select value={selectedPanchayath} onValueChange={setSelectedPanchayath}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by panchayath" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Panchayaths</SelectItem>
                  {panchayaths.map((panchayath) => (
                    <SelectItem key={panchayath.id} value={panchayath.id}>
                      {panchayath.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => fetchNotes(selectedPanchayath)}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredNotes.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {searchTerm ? 'No notes found matching your search.' : 'No notes found for the selected panchayath.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredNotes.map((note) => (
                <div key={note.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">
                        {getPanchayathName(note.panchayath_id)}
                      </h4>
                      <p className="text-xs text-gray-500">
                        By {note.created_by} • {format(new Date(note.created_at), 'PPP p')}
                      </p>
                    </div>
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
