
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Building, Loader2, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { PanchayathDetails } from "@/components/PanchayathDetails";
import { DailyActivityLog } from "@/components/DailyActivityLog";

const PanchayathNotes = () => {
  const { panchayaths, isLoading } = useSupabaseHierarchy();
  const [selectedPanchayath, setSelectedPanchayath] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-orange-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const selectedPanchayathData = selectedPanchayath 
    ? panchayaths.find(p => p.id === selectedPanchayath)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Panchayath Notes</h1>
              <p className="text-gray-600">View and manage notes about panchayath status and updates</p>
            </div>
            <DailyActivityLog />
          </div>
        </div>

        {!selectedPanchayath ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Select Panchayath
              </CardTitle>
              <CardDescription>
                Choose a panchayath to view its details and notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {panchayaths.map((panchayath) => (
                  <div 
                    key={panchayath.id} 
                    className="flex items-center justify-between p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedPanchayath(panchayath.id)}
                  >
                    <div>
                      <h3 className="font-medium text-lg">{panchayath.name}</h3>
                      <p className="text-sm text-gray-600">{panchayath.district}, {panchayath.state}</p>
                    </div>
                    <div className="flex items-center gap-2 text-gray-500">
                      <FileText className="h-4 w-4" />
                      <span className="text-sm">View Notes</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ) : (
          <div>
            {selectedPanchayathData && (
              <PanchayathDetails 
                panchayath={selectedPanchayathData} 
                onBack={() => setSelectedPanchayath(null)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PanchayathNotes;
