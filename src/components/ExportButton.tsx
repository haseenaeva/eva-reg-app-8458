
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

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      // Create HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <title>Hierarchy Report - ${panchayathName}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #333; border-bottom: 2px solid #333; padding-bottom: 10px; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .role-coordinator { background-color: #fef2f2; }
              .role-supervisor { background-color: #f0f9ff; }
              .role-group-leader { background-color: #fef3c7; }
              .role-pro { background-color: #f0fdf4; }
            </style>
          </head>
          <body>
            <h1>Hierarchy Report - ${panchayathName}</h1>
            <p>Generated on: ${new Date().toLocaleDateString()}</p>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Ward</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                ${agents.map(agent => `
                  <tr class="role-${agent.role}">
                    <td>${agent.name}</td>
                    <td>${agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' ')}</td>
                    <td>${agent.ward || '-'}</td>
                    <td>${agent.phone || '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </body>
        </html>
      `;

      // Create a blob and download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hierarchy-${panchayathName.replace(/[^a-zA-Z0-9]/g, '-')}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Hierarchy report exported as HTML file (can be converted to PDF)"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hierarchy report",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    try {
      // Create CSV content
      const csvContent = [
        ['Name', 'Role', 'Ward', 'Phone'],
        ...agents.map(agent => [
          agent.name,
          agent.role.charAt(0).toUpperCase() + agent.role.slice(1).replace('-', ' '),
          agent.ward || '',
          agent.phone || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n');

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hierarchy-${panchayathName.replace(/[^a-zA-Z0-9]/g, '-')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful",
        description: "Hierarchy data exported as CSV file"
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export hierarchy data",
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
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
