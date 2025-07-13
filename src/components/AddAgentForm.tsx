
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Agent } from "@/hooks/useSupabaseHierarchy";

interface AddAgentFormProps {
  panchayathId: string;
  agents: Agent[];
  onAgentAdded: () => void;
  addAgent: (agent: Omit<Agent, 'id' | 'created_at' | 'updated_at'>) => Promise<Agent>;
}

export const AddAgentForm = ({ panchayathId, agents, onAgentAdded, addAgent }: AddAgentFormProps) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState<Agent['role'] | ''>('');
  const [superiorId, setSuperiorId] = useState('');
  const [phone, setPhone] = useState('');
  const [ward, setWard] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getSuperiorOptions = (selectedRole: Agent['role']) => {
    const roleHierarchy = {
      'supervisor': 'coordinator',
      'group-leader': 'supervisor', 
      'pro': 'group-leader'
    } as const;
    
    const superiorRole = roleHierarchy[selectedRole as keyof typeof roleHierarchy];
    if (!superiorRole) return [];
    
    return agents.filter(agent => 
      agent.panchayath_id === panchayathId && agent.role === superiorRole
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !role) return;

    setIsSubmitting(true);
    try {
      await addAgent({
        name,
        role: role as Agent['role'],
        panchayath_id: panchayathId,
        superior_id: superiorId || null,
        phone: phone || null,
        ward: ward || null,
      });

      setName('');
      setRole('');
      setSuperiorId('');
      setPhone('');
      setWard('');
      onAgentAdded();
    } catch (error) {
      console.error('Error adding agent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const superiorOptions = role ? getSuperiorOptions(role as Agent['role']) : [];
  const showSuperiorSelect = role && role !== 'coordinator';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add New Agent</CardTitle>
        <CardDescription>Add a new agent to this panchayath</CardDescription>
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
              <Label htmlFor="role">Role *</Label>
              <Select value={role} onValueChange={(value) => setRole(value as Agent['role'])}>
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
  );
};
