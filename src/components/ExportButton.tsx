
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  agents: Agent[];
  panchayathName: string;
}

export const ExportButton = ({ agents, panchayathName }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const buildHierarchyTree = () => {
    const coordinators = agents.filter(agent => agent.role === 'coordinator');
    let hierarchyText = '';

    coordinators.forEach((coordinator) => {
      hierarchyText += `. ${coordinator.name} (Coordinator)\n`;
      
      const supervisors = agents.filter(agent => agent.superior_id === coordinator.id && agent.role === 'supervisor');
      supervisors.forEach((supervisor) => {
        hierarchyText += `\t. ${supervisor.name} (Supervisor)\n`;
        
        const groupLeaders = agents.filter(agent => agent.superior_id === supervisor.id && agent.role === 'group-leader');
        groupLeaders.forEach((groupLeader) => {
          hierarchyText += `\t\t. ${groupLeader.name} (Group Leader)\n`;
          
          const pros = agents.filter(agent => agent.superior_id === groupLeader.id && agent.role === 'pro');
          pros.forEach((pro) => {
            hierarchyText += `\t\t\t. ${pro.name} (P.R.O)\n`;
          });
        });
      });
    });

    return hierarchyText;
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const hierarchyTree = buildHierarchyTree();
      
      // Create HTML content for PDF with tree structure
      const htmlContent = `
        <html>
          <head>
            <title>Hierarchy Report - ${panchayathName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              .hierarchy-tree { 
                font-family: monospace; 
                white-space: pre-wrap; 
                line-height: 1.6; 
                font-size: 14px;
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #dee2e6;
              }
              .coordinator { font-weight: bold; color: #dc3545; }
              .supervisor { font-weight: bold; color: #6f42c1; }
              .group-leader { font-weight: bold; color: #fd7e14; }
              .pro { font-weight: bold; color: #198754; }
            </style>
          </head>
          <body>
            <h1>Hierarchy Report - ${panchayathName}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <p>Total Agents: ${agents.length}</p>
            <div class="hierarchy-tree">${hierarchyTree}</div>
          </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hierarchy-tree-${panchayathName.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Hierarchy tree exported as HTML file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hierarchy tree",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const hierarchyTree = buildHierarchyTree();
      
      // Create CSV content with hierarchy tree
      const csvContent = `Hierarchy Tree - ${panchayathName}\nGenerated on: ${new Date().toLocaleDateString()}\nTotal Agents: ${agents.length}\n\n${hierarchyTree}`;

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/plain;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hierarchy-tree-${panchayathName.replace(/[^a-zA-Z0-9]/g, '-')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Hierarchy tree exported as text file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hierarchy tree",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (agents.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export Tree'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export Tree as HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export Tree as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
