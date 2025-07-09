
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useHierarchyStore } from "@/hooks/useHierarchyStore";

export const AddPanchayathForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    district: '',
    state: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addPanchayath } = useHierarchyStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.district || !formData.state) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      addPanchayath(formData);
      toast({
        title: "Success",
        description: "Panchayath added successfully"
      });
      setFormData({ name: '', district: '', state: '' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add panchayath",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div>
          <Label htmlFor="name">Panchayath Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter panchayath name"
            required
          />
        </div>

        <div>
          <Label htmlFor="district">District *</Label>
          <Input
            id="district"
            value={formData.district}
            onChange={(e) => setFormData(prev => ({ ...prev, district: e.target.value }))}
            placeholder="Enter district name"
            required
          />
        </div>

        <div>
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
            placeholder="Enter state name"
            required
          />
        </div>
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Adding..." : "Add Panchayath"}
      </Button>
    </form>
  );
};
