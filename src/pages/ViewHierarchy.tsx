
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, TreePine, Loader2, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { HorizontalOrganizationChart } from "@/components/HorizontalOrganizationChart";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ViewHierarchy = () => {
  const [selectedPanchayath, setSelectedPanchayath] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [panchayathToDelete, setPanchayathToDelete] = useState<string>('');
  const { panchayaths, agents, isLoading, refetch } = useSupabaseHierarchy();
  const { toast } = useToast();

  const selectedPanchayathData = panchayaths.find(p => p.id === selectedPanchayath);
  const selectedPanchayathAgents = selectedPanchayath ? 
    agents.filter(agent => agent.panchayath_id === selectedPanchayath) : [];

  const deletePanchayath = async (panchayathId: string) => {
    try {
      // First delete all agents in this panchayath
      const { error: agentsError } = await supabase
        .from('agents')
        .delete()
        .eq('panchayath_id', panchayathId);

      if (agentsError) throw agentsError;

      // Then delete the panchayath
      const { error: panchayathError } = await supabase
        .from('panchayaths')
        .delete()
        .eq('id', panchayathId);

      if (panchayathError) throw panchayathError;

      toast({
        title: "Success",
        description: "Panchayath deleted successfully",
      });
      
      // Reset selection if deleted panchayath was selected
      if (selectedPanchayath === panchayathId) {
        setSelectedPanchayath('');
      }
      
      refetch();
      setDeleteDialogOpen(false);
      setPanchayathToDelete('');
    } catch (error) {
      console.error('Error deleting panchayath:', error);
      toast({
        title: "Error",
        description: "Failed to delete panchayath",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading hierarchy data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <TreePine className="h-8 w-8 text-blue-600" />
            View Hierarchy
          </h1>
          <p className="text-gray-600">Select a panchayath to view its organizational structure</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Panchayath</CardTitle>
            <CardDescription>Choose a panchayath to view its complete hierarchy</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedPanchayath} onValueChange={setSelectedPanchayath}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a panchayath to view hierarchy" />
              </SelectTrigger>
              <SelectContent>
                {panchayaths.length === 0 ? (
                  <SelectItem value="none" disabled>No panchayaths available</SelectItem>
                ) : (
                  panchayaths.map((panchayath) => (
                    <SelectItem key={panchayath.id} value={panchayath.id}>
                      {panchayath.name} - {panchayath.district}, {panchayath.state}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Panchayaths Management */}
        {panchayaths.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Manage Panchayaths ({panchayaths.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {panchayaths.map((panchayath) => (
                  <div key={panchayath.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                    <div>
                      <h3 className="font-medium">{panchayath.name}</h3>
                      <p className="text-sm text-gray-600">{panchayath.district}, {panchayath.state}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-gray-500">
                        {agents.filter(a => a.panchayath_id === panchayath.id).length} agents
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setPanchayathToDelete(panchayath.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {selectedPanchayath && selectedPanchayathData && (
          <Card>
            <CardContent className="p-6">
              <HorizontalOrganizationChart 
                panchayathId={selectedPanchayath}
                agents={selectedPanchayathAgents}
                panchayathName={`${selectedPanchayathData.name} - ${selectedPanchayathData.district}, ${selectedPanchayathData.state}`}
                onRefresh={refetch}
              />
            </CardContent>
          </Card>
        )}

        {panchayaths.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Panchayaths Found</h3>
              <p className="text-gray-600 mb-4">
                You need to add panchayaths and agents before viewing the hierarchy.
              </p>
              <Link to="/add-agents">
                <Button>Add Panchayaths & Agents</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Delete Panchayath Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Panchayath</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this panchayath? This will also delete all agents associated with it. This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={() => deletePanchayath(panchayathToDelete)}
              >
                Delete Panchayath
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default ViewHierarchy;
