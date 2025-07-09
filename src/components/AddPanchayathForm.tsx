
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabaseHierarchy } from "@/hooks/useSupabaseHierarchy";

export const AddPanchayathForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    state: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { addPanchayath } = useSupabaseHierarchy();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.district || !formData.state) return;

    setIsSubmitting(true);
    try {
      await addPanchayath(formData);
      setFormData({ name: '', district: '', state: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Panchayath Name</Label>
        <Input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Enter panchayath name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="district">District</Label>
        <Input
          id="district"
          type="text"
          value={formData.district}
          onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
          placeholder="Enter district name"
          required
        />
      </div>
      
      <div>
        <Label htmlFor="state">State</Label>
        <Input
          id="state"
          type="text"
          value={formData.state}
          onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
          placeholder="Enter state name"
          required
        />
      </div>
      
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Adding..." : "Add Panchayath"}
      </Button>
    </form>
  );
};
