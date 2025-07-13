
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const AddAgents = () => {
  const { panchayaths, agents, isLoading, addAgent, refetch } = useSupabaseHierarchy();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [role, setRole] = useState<'coordinator' | 'supervisor' | 'group-leader' | 'pro' | ''>('');
  const [panchayathId, setPanchayathId] = useState('');
  const [superiorId, setSuperiorId] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('');

  const getSuperiorOptions = (selectedRole: string, selectedPanchayath: string) => {
    const roleHierarchy = {
      'supervisor': 'coordinator',
      'group-leader': 'supervisor', 
      'pro': 'group-leader'
    } as const;
    
    const superiorRole = roleHierarchy[selectedRole as keyof typeof roleHierarchy];
    if (!superiorRole) return [];
    
    return agents.filter(agent => 
      agent.panchayath_id === selectedPanchayath && agent.role === superiorRole
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role || !panchayathId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addAgent({
        name,
        role: role as 'coordinator' | 'supervisor' | 'group-leader' | 'pro',
        panchayath_id: panchayathId,
        superior_id: superiorId || null,
        phone: phone || null,
        ward: ward || null,
      });

      // Reset form
      setName('');
      setRole('');
      setPanchayathId('');
      setSuperiorId('');
      setPhone('');
      setWard('');
      
      refetch();
      toast({
        title: "Success",
        description: "Agent added successfully",
      });
    } catch (error) {
      console.error('Error adding agent:', error);
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

  const superiorOptions = role && panchayathId ? getSuperiorOptions(role, panchayathId) : [];
  const showSuperiorSelect = role && role !== 'coordinator';

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
          <p className="text-gray-600">Manage your staff members</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              New Agent
            </CardTitle>
            <CardDescription>
              Add a new agent to the hierarchy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter agent name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="panchayath">Panchayath *</Label>
                  <Select value={panchayathId} onValueChange={setPanchayathId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select panchayath" />
                    </SelectTrigger>
                    <SelectContent>
                      {panchayaths.map((panchayath) => (
                        <SelectItem key={panchayath.id} value={panchayath.id}>
                          {panchayath.name} - {panchayath.district}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="role">Role *</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coordinator">Coordinator</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="group-leader">Group Leader</SelectItem>
                      <SelectItem value="pro">P.R.O</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {showSuperiorSelect && (
                  <div>
                    <Label htmlFor="superior">Superior {superiorOptions.length > 0 ? '*' : ''}</Label>
                    <Select value={superiorId} onValueChange={setSuperiorId}>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          superiorOptions.length > 0 
                            ? "Select superior" 
                            : "No superiors available"
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {superiorOptions.map((superior) => (
                          <SelectItem key={superior.id} value={superior.id}>
                            {superior.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter phone number"
                    type="tel"
                  />
                </div>

                <div>
                  <Label htmlFor="ward">Ward</Label>
                  <Input
                    id="ward"
                    value={ward}
                    onChange={(e) => setWard(e.target.value)}
                    placeholder="Enter ward"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? 'Adding Agent...' : 'Add Agent'}
              </Button>
            </form>
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
