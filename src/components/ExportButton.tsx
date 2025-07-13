
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { Agent } from "@/hooks/useSupabaseHierarchy";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';

interface ExportButtonProps {
  agents: Agent[];
  panchayathName: string;
}

export const ExportButton = ({ agents, panchayathName }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const buildCompactHierarchy = () => {
    const coordinators = agents.filter(agent => agent.role === 'coordinator');
    const hierarchyData: any[] = [];

    coordinators.forEach((coordinator) => {
      // Add coordinator row
      hierarchyData.push({
        'Level 1 (Coordinator)': coordinator.name,
        'Level 2 (Supervisor)': '',
        'Level 3 (Group Leader)': '',
        'Level 4 (P.R.O)': '',
        'Phone': coordinator.phone || '',
        'Email': coordinator.email || '',
        'Ward': coordinator.ward || ''
      });
      
      const supervisors = agents.filter(agent => agent.superior_id === coordinator.id && agent.role === 'supervisor');
      supervisors.forEach((supervisor) => {
        // Add supervisor row
        hierarchyData.push({
          'Level 1 (Coordinator)': '',
          'Level 2 (Supervisor)': supervisor.name,
          'Level 3 (Group Leader)': '',
          'Level 4 (P.R.O)': '',
          'Phone': supervisor.phone || '',
          'Email': supervisor.email || '',
          'Ward': supervisor.ward || ''
        });
        
        const groupLeaders = agents.filter(agent => agent.superior_id === supervisor.id && agent.role === 'group-leader');
        groupLeaders.forEach((groupLeader) => {
          // Add group leader row
          hierarchyData.push({
            'Level 1 (Coordinator)': '',
            'Level 2 (Supervisor)': '',
            'Level 3 (Group Leader)': groupLeader.name,
            'Level 4 (P.R.O)': '',
            'Phone': groupLeader.phone || '',
            'Email': groupLeader.email || '',
            'Ward': groupLeader.ward || ''
          });
          
          const pros = agents.filter(agent => agent.superior_id === groupLeader.id && agent.role === 'pro');
          pros.forEach((pro) => {
            // Add P.R.O row
            hierarchyData.push({
              'Level 1 (Coordinator)': '',
              'Level 2 (Supervisor)': '',
              'Level 3 (Group Leader)': '',
              'Level 4 (P.R.O)': pro.name,
              'Phone': pro.phone || '',
              'Email': pro.email || '',
              'Ward': pro.ward || ''
            });
          });
        });
      });
    });

    return hierarchyData;
  };

  const buildHierarchyTree = () => {
    const coordinators = agents.filter(agent => agent.role === 'coordinator');
    let hierarchyText = '';

    coordinators.forEach((coordinator) => {
      hierarchyText += `${coordinator.name} (Coordinator)\n`;
      
      const supervisors = agents.filter(agent => agent.superior_id === coordinator.id && agent.role === 'supervisor');
      supervisors.forEach((supervisor) => {
        hierarchyText += `\t${supervisor.name} (Supervisor)\n`;
        
        const groupLeaders = agents.filter(agent => agent.superior_id === supervisor.id && agent.role === 'group-leader');
        groupLeaders.forEach((groupLeader) => {
          hierarchyText += `\t\t${groupLeader.name} (Group Leader)\n`;
          
          const pros = agents.filter(agent => agent.superior_id === groupLeader.id && agent.role === 'pro');
          pros.forEach((pro) => {
            hierarchyText += `\t\t\t${pro.name} (P.R.O)\n`;
          });
        });
      });
    });

    return hierarchyText;
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      const hierarchyData = buildCompactHierarchy();
      
      // Create workbook and worksheet
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(hierarchyData);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Level 1 (Coordinator)
        { wch: 25 }, // Level 2 (Supervisor)
        { wch: 25 }, // Level 3 (Group Leader)
        { wch: 25 }, // Level 4 (P.R.O)
        { wch: 15 }, // Phone
        { wch: 25 }, // Email
        { wch: 10 }  // Ward
      ];

      // Add worksheet to workbook
      XLSX.utils.book_append_sheet(wb, ws, "Hierarchy");

      // Create info sheet
      const infoData = [
        { Info: 'Panchayath', Value: panchayathName },
        { Info: 'Generated On', Value: new Date().toLocaleDateString() },
        { Info: 'Total Agents', Value: agents.length },
        { Info: 'Coordinators', Value: agents.filter(a => a.role === 'coordinator').length },
        { Info: 'Supervisors', Value: agents.filter(a => a.role === 'supervisor').length },
        { Info: 'Group Leaders', Value: agents.filter(a => a.role === 'group-leader').length },
        { Info: 'P.R.O', Value: agents.filter(a => a.role === 'pro').length }
      ];
      const infoWs = XLSX.utils.json_to_sheet(infoData);
      infoWs['!cols'] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, infoWs, "Summary");

      // Save file
      XLSX.writeFile(wb, `hierarchy-${panchayathName.replace(/[^a-zA-Z0-9]/g, '-')}.xlsx`);

      toast({
        title: "Export Successful",
        description: "Hierarchy exported as Excel file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hierarchy",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
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

  const exportToText = async () => {
    setIsExporting(true);
    try {
      const hierarchyTree = buildHierarchyTree();
      
      // Create text content with hierarchy tree
      const textContent = `Hierarchy Tree - ${panchayathName}\nGenerated on: ${new Date().toLocaleDateString()}\nTotal Agents: ${agents.length}\n\n${hierarchyTree}`;

      // Create blob and download
      const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8;' });
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
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel (XLSX)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as HTML
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToText}>
          <FileText className="h-4 w-4 mr-2" />
          Export as Text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
