
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Loader2, Building } from "lucide-react";
import { Link } from "react-router-dom";
import { AddAgentForm } from "@/components/AddAgentForm";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { PanchayathNotes } from "@/components/PanchayathNotes";

const AddAgents = () => {
  const [activeTab, setActiveTab] = useState<'agent' | 'notes'>('agent');
  const { panchayaths, agents, isLoading } = useSupabaseHierarchy();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Staff Management</h1>
          <p className="text-gray-600">Manage your staff and track panchayath updates</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              activeTab === 'agent' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveTab('agent')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Add Agent</CardTitle>
              <CardDescription>Add coordinators, supervisors, group leaders, and P.R.Os</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              activeTab === 'notes' 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveTab('notes')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Panchayath Notes</CardTitle>
              <CardDescription>Add and view notes about panchayath status and updates</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === 'agent' ? <Users className="h-5 w-5" /> : <Building className="h-5 w-5" />}
              {activeTab === 'agent' ? 'New Agent' : 'Panchayath Notes'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'agent' 
                ? 'Add a new agent to the hierarchy' 
                : 'Add notes and comments about panchayath status'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'agent' ? (
              <AddAgentForm />
            ) : (
              <PanchayathNotes />
            )}
          </CardContent>
        </Card>

        {panchayaths.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Existing Panchayaths ({panchayaths.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {panchayaths.map((panchayath) => (
                  <div key={panchayath.id} className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm">
                    <div>
                      <h3 className="font-medium">{panchayath.name}</h3>
                      <p className="text-sm text-gray-600">{panchayath.district}, {panchayath.state}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {agents.filter(a => a.panchayath_id === panchayath.id).length} agents
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AddAgents;
