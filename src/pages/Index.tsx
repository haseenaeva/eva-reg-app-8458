
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TreePine, Plus, Eye } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <TreePine className="h-10 w-10 text-blue-600" />
            Agent Hierarchy Management
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage your organization's staff hierarchy across panchayaths with coordinators, supervisors, group leaders, and P.R.Os
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                <Plus className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Add Agents</CardTitle>
              <CardDescription className="text-gray-600">
                Add new panchayaths and manage staff hierarchy including coordinators, supervisors, group leaders, and P.R.Os
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/add-agents">
                <Button size="lg" className="w-full bg-green-600 hover:bg-green-700">
                  <Plus className="mr-2 h-5 w-5" />
                  Add Agents
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-200 border-2 border-transparent hover:border-blue-200">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">View Hierarchy</CardTitle>
              <CardDescription className="text-gray-600">
                Select a panchayath to view the complete organizational chart and staff structure
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/view-hierarchy">
                <Button size="lg" variant="outline" className="w-full border-blue-600 text-blue-600 hover:bg-blue-50">
                  <Users className="mr-2 h-5 w-5" />
                  View Hierarchy
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="bg-white rounded-lg p-6 shadow-md max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Hierarchy Structure</h2>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Team Leader</span>
                <span>→ Manages multiple panchayaths</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Coordinator</span>
                <span>→ Superior of panchayath, reports to Team Leader</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Supervisor</span>
                <span>→ 1-4 persons under Coordinator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Group Leader</span>
                <span>→ 5-10 persons under Supervisor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">P.R.O</span>
                <span>→ 5-10 persons under Group Leader</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
