
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, TreePine, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { EnhancedOrganizationChart } from "@/components/EnhancedOrganizationChart";

const ViewHierarchy = () => {
  const [selectedPanchayath, setSelectedPanchayath] = useState<string>('');
  const { panchayaths, agents, isLoading } = useSupabaseHierarchy();

  const selectedPanchayathData = panchayaths.find(p => p.id === selectedPanchayath);
  const selectedPanchayathAgents = selectedPanchayath ? 
    agents.filter(agent => agent.panchayath_id === selectedPanchayath) : [];

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

        {selectedPanchayath && selectedPanchayathData && (
          <Card>
            <CardContent className="p-6">
              <EnhancedOrganizationChart 
                panchayathId={selectedPanchayath}
                agents={selectedPanchayathAgents}
                panchayathName={`${selectedPanchayathData.name} - ${selectedPanchayathData.district}, ${selectedPanchayathData.state}`}
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
      </div>
    </div>
  );
};

export default ViewHierarchy;
