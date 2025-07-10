
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useSupabaseHierarchy, Agent } from "@/hooks/useSupabaseHierarchy";

export const AddAgentForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    role: '' as Agent['role'] | '',
    panchayathId: '',
    superiorId: '',
    email: '',
    phone: '',
    ward: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { panchayaths, addAgent, getSuperiorOptions } = useSupabaseHierarchy();

  const superiorOptions = formData.panchayathId && formData.role ? 
    getSuperiorOptions(formData.panchayathId, formData.role) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.role || !formData.panchayathId) return;

    setIsSubmitting(true);
    try {
      await addAgent({
        name: formData.name,
        role: formData.role,
        panchayath_id: formData.panchayathId,
        superior_id: formData.superiorId || undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        ward: formData.ward || undefined
      });
      setFormData({
        name: '',
        role: '',
        panchayathId: '',
        superiorId: '',
        email: '',
        phone: '',
        ward: ''
      });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleOptions = [
    { value: 'coordinator', label: 'Coordinator' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'group-leader', label: 'Group Leader' },
    { value: 'pro', label: 'P.R.O' }
  ] as const;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Agent Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter agent name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value as Agent['role'], superiorId: '' }))}>
          <SelectTrigger>
            <SelectValue placeholder="Select agent role" />
          </SelectTrigger>
          <SelectContent>
            {roleOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="panchayath">Panchayath</Label>
        <Select value={formData.panchayathId} onValueChange={(value) => setFormData(prev => ({ ...prev, panchayathId: value, superiorId: '' }))}>
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
      
      {formData.role && formData.role !== 'coordinator' && superiorOptions.length > 0 && (
        <div>
          <Label htmlFor="superior">Reports To</Label>
          <Select value={formData.superiorId} onValueChange={(value) => setFormData(prev => ({ ...prev, superiorId: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select superior" />
            </SelectTrigger>
            <SelectContent>
              {superiorOptions.map((superior) => (
                <SelectItem key={superior.id} value={superior.id}>
                  {superior.name} ({superior.role})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div>
        <Label htmlFor="ward">Ward</Label>
        <Input
          id="ward"
          type="text"
          value={formData.ward}
          onChange={(e) => setFormData(prev => ({ ...prev, ward: e.target.value }))}
          placeholder="Enter ward number or name"
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email (Optional)</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          placeholder="Enter email address"
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone (Optional)</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Enter phone number"
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Agent"}
      </Button>
    </form>
  );
};
