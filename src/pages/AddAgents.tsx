
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Building, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { AddPanchayathForm } from "@/components/AddPanchayathForm";
import { AddAgentForm } from "@/components/AddAgentForm";
import { useHierarchyStore } from "@/hooks/useHierarchyStore";

const AddAgents = () => {
  const [activeTab, setActiveTab] = useState<'panchayath' | 'agent'>('panchayath');
  const { data } = useHierarchyStore();

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Agents & Panchayaths</h1>
          <p className="text-gray-600">Manage your organizational structure by adding panchayaths and agents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              activeTab === 'panchayath' 
                ? 'ring-2 ring-green-500 bg-green-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveTab('panchayath')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <CardTitle className="text-lg">Add Panchayath</CardTitle>
              <CardDescription>Create new panchayaths to organize your agents</CardDescription>
            </CardHeader>
          </Card>

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
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              {activeTab === 'panchayath' ? 'New Panchayath' : 'New Agent'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'panchayath' 
                ? 'Add a new panchayath to your system' 
                : 'Add a new agent to the hierarchy'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'panchayath' ? (
              <AddPanchayathForm />
            ) : (
              <AddAgentForm />
            )}
          </CardContent>
        </Card>

        {data.panchayaths.length > 0 && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Existing Panchayaths ({data.panchayaths.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {data.panchayaths.map((panchayath) => (
                  <div key={panchayath.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-medium">{panchayath.name}</h3>
                      <p className="text-sm text-gray-600">{panchayath.district}, {panchayath.state}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {data.agents.filter(a => a.panchayathId === panchayath.id).length} agents
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
