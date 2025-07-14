import * as XLSX from 'xlsx';

export const createSampleHierarchyFile = () => {
  // Sample hierarchy data in the correct format
  const sampleData = [
    {
      'Level 1 (Coordinator)': 'Fousiya',
      'Level 2 (Supervisor)': 'Mariya kutti',
      'Level 3 (Group Leader)': 'Safeena',
      'Level 4 (P.R.O)': 'Rasheeda',
      'Phone': '7025715877',
      'Email': 'rasheeda@example.com',
      'Ward': '7'
    },
    {
      'Level 1 (Coordinator)': 'Fousiya',
      'Level 2 (Supervisor)': 'Mariya kutti',
      'Level 3 (Group Leader)': 'Safeena',
      'Level 4 (P.R.O)': 'Agent Pro 2',
      'Phone': '7025715878',
      'Email': 'agent2@example.com',
      'Ward': '6'
    },
    {
      'Level 1 (Coordinator)': 'Fousiya',
      'Level 2 (Supervisor)': 'Mariya kutti',
      'Level 3 (Group Leader)': 'Group Leader 2',
      'Level 4 (P.R.O)': 'Agent Pro 3',
      'Phone': '7025715879',
      'Email': 'agent3@example.com',
      'Ward': '5'
    },
    {
      'Level 1 (Coordinator)': 'Fousiya',
      'Level 2 (Supervisor)': 'Renju',
      'Level 3 (Group Leader)': 'Group Leader 3',
      'Level 4 (P.R.O)': 'Agent Pro 4',
      'Phone': '7025715880',
      'Email': 'agent4@example.com',
      'Ward': '5'
    },
    {
      'Level 1 (Coordinator)': 'Fousiya',
      'Level 2 (Supervisor)': 'Renju',
      'Level 3 (Group Leader)': 'Group Leader 4',
      'Level 4 (P.R.O)': 'Agent Pro 5',
      'Phone': '7025715881',
      'Email': 'agent5@example.com',
      'Ward': '5'
    }
  ];

  // Create workbook and worksheet
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(sampleData);
  
  // Add the worksheet to workbook with the exact name expected by import
  XLSX.utils.book_append_sheet(wb, ws, 'Hierarchy');
  
  // Generate buffer and create download
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  // Create download link
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sample-hierarchy-import.xlsx';
  link.click();
  
  // Cleanup
  URL.revokeObjectURL(url);
};