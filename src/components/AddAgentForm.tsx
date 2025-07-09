
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useHierarchyStore } from "@/hooks/useHierarchyStore";
import { AgentRole, ROLE_HIERARCHY } from "@/types/hierarchy";

export const AddAgentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '' as AgentRole | '',
    panchayathId: '',
    superiorId: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [superiorOptions, setSuperiorOptions] = useState<any[]>([]);
  
  const { data, addAgent, getSuperiorOptions } = useHierarchyStore();
  const { toast } = useToast();

  useEffect(() => {
    if (formData.panchayathId && formData.role) {
      const options = getSuperiorOptions(formData.panchayathId, formData.role);
      setSuperiorOptions(options);
      if (options.length === 0) {
        setFormData(prev => ({ ...prev, superiorId: '' }));
      }
    }
  }, [formData.panchayathId, formData.role, getSuperiorOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.panchayathId) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      addAgent({
        name: formData.name,
        role: formData.role as AgentRole,
        panchayathId: formData.panchayathId,
        superiorId: formData.superiorId || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined
      });
      
      toast({
        title: "Success",
        description: "Agent added successfully"
      });
      
      setFormData({
        name: '',
        role: '' as AgentRole | '',
        panchayathId: '',
        superiorId: '',
        email: '',
        phone: ''
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add agent",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (data.panchayaths.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600 mb-4">No panchayaths available. Please add a panchayath first.</p>
        <Button onClick={() => window.location.reload()}>Refresh</Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="panchayath">Select Panchayath *</Label>
          <Select 
            value={formData.panchayathId} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, panchayathId: value, superiorId: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a panchayath" />
            </SelectTrigger>
            <SelectContent>
              {data.panchayaths.map((panchayath) => (
                <SelectItem key={panchayath.id} value={panchayath.id}>
                  {panchayath.name} - {panchayath.district}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="role">Role *</Label>
          <Select 
            value={formData.role} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as AgentRole, superiorId: '' }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choose a role" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(ROLE_HIERARCHY).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.role && formData.role !== 'coordinator' && (
          <div>
            <Label htmlFor="superior">Reports To ({ROLE_HIERARCHY[formData.role]?.reportsTo})</Label>
            <Select 
              value={formData.superiorId} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, superiorId: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  superiorOptions.length > 0 
                    ? "Select superior" 
                    : `No ${ROLE_HIERARCHY[formData.role]?.reportsTo} available`
                } />
              </SelectTrigger>
              <SelectContent>
                {superiorOptions.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name} ({ROLE_HIERARCHY[agent.role]?.label})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <Label htmlFor="name">Agent Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter agent name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email"
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="Enter phone number"
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Agent"}
      </Button>
    </form>
  );
};
