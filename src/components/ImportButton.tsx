
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, FileSpreadsheet, Download } from "lucide-react";
import { createSampleHierarchyFile } from "@/utils/createSampleHierarchy";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

interface ImportButtonProps {
  panchayathId: string;
  onRefresh: () => void;
}

export const ImportButton = ({ panchayathId, onRefresh }: ImportButtonProps) => {
  const [isImporting, setIsImporting] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please select a valid XLSX file",
        variant: "destructive"
      });
    }
  };

  const processImportData = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Look for the Hierarchy sheet
      const hierarchySheetName = workbook.SheetNames.find(name => name === 'Hierarchy');
      if (!hierarchySheetName) {
        throw new Error('Hierarchy sheet not found in the Excel file');
      }

      const worksheet = workbook.Sheets[hierarchySheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (data.length === 0) {
        throw new Error('No data found in the Hierarchy sheet');
      }

      // Process the hierarchical data
      const agentsToCreate: any[] = [];
      const agentNameToId: { [key: string]: string } = {};

      // First pass: Create all agents without superior relationships
      for (const row of data) {
        const coordinator = row['Level 1 (Coordinator)'];
        const supervisor = row['Level 2 (Supervisor)'];
        const groupLeader = row['Level 3 (Group Leader)'];
        const pro = row['Level 4 (P.R.O)'];

        // Add coordinator if exists and not already added
        if (coordinator && !agentNameToId[coordinator]) {
          const agentId = crypto.randomUUID();
          agentNameToId[coordinator] = agentId;
          agentsToCreate.push({
            id: agentId,
            name: coordinator,
            role: 'coordinator',
            panchayath_id: panchayathId,
            superior_id: null,
            phone: row['Phone'] || null,
            ward: row['Ward'] || null
          });
        }

        // Add supervisor if exists and not already added
        if (supervisor && !agentNameToId[supervisor]) {
          const agentId = crypto.randomUUID();
          agentNameToId[supervisor] = agentId;
          agentsToCreate.push({
            id: agentId,
            name: supervisor,
            role: 'supervisor',
            panchayath_id: panchayathId,
            superior_id: coordinator ? agentNameToId[coordinator] : null,
            phone: row['Phone'] || null,
            ward: row['Ward'] || null
          });
        }

        // Add group leader if exists and not already added
        if (groupLeader && !agentNameToId[groupLeader]) {
          const agentId = crypto.randomUUID();
          agentNameToId[groupLeader] = agentId;
          agentsToCreate.push({
            id: agentId,
            name: groupLeader,
            role: 'group-leader',
            panchayath_id: panchayathId,
            superior_id: supervisor ? agentNameToId[supervisor] : null,
            phone: row['Phone'] || null,
            ward: row['Ward'] || null
          });
        }

        // Add PRO if exists and not already added
        if (pro && !agentNameToId[pro]) {
          const agentId = crypto.randomUUID();
          agentNameToId[pro] = agentId;
          agentsToCreate.push({
            id: agentId,
            name: pro,
            role: 'pro',
            panchayath_id: panchayathId,
            superior_id: groupLeader ? agentNameToId[groupLeader] : null,
            phone: row['Phone'] || null,
            ward: row['Ward'] || null
          });
        }
      }

      // Insert all agents into database
      const { error } = await supabase
        .from('agents')
        .upsert(agentsToCreate, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Import Successful",
        description: `Imported ${agentsToCreate.length} agents successfully`
      });

      onRefresh();
      setImportDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import hierarchy",
        variant: "destructive"
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setImportDialogOpen(true)}>
        <Upload className="h-4 w-4 mr-2" />
        Import Hierarchy
      </Button>

      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import Hierarchy from Excel</DialogTitle>
            <DialogDescription>
              Upload an XLSX file with hierarchy data to import agents. The file should have the same format as the exported hierarchy file.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="excel-file">Select Excel File</Label>
                <Input
                  id="excel-file"
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={createSampleHierarchyFile}
                className="ml-4"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Sample
              </Button>
            </div>
            
            {selectedFile && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <FileSpreadsheet className="h-4 w-4 text-green-600" />
                <span className="text-sm">{selectedFile.name}</span>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={processImportData}
              disabled={!selectedFile || isImporting}
            >
              {isImporting ? 'Importing...' : 'Import Hierarchy'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
