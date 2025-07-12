
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster"
import Index from './pages/Index';
import AddAgents from './pages/AddAgents';
import ViewHierarchy from './pages/ViewHierarchy';
import TaskManagement from './pages/TaskManagement';
import PanchayathNotes from './pages/PanchayathNotes';
import NotFound from './pages/NotFound';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/add-agents" element={<AddAgents />} />
          <Route path="/view-hierarchy" element={<ViewHierarchy />} />
          <Route path="/task-management" element={<TaskManagement />} />
          <Route path="/panchayath-notes" element={<PanchayathNotes />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
