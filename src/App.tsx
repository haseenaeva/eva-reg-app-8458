
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from "@/components/ui/toaster";
import Index from './pages/Index';
import AddAgents from './pages/AddAgents';
import ViewHierarchy from './pages/ViewHierarchy';
import TaskManagement from './pages/TaskManagement';
import PanchayathNotes from './pages/PanchayathNotes';
import NotFound from './pages/NotFound';

import GuestLogin from './pages/GuestLogin';
import TeamLoginPage from './pages/TeamLoginPage';
import TeamDashboard from './pages/TeamDashboard';
import { AuthProvider } from './components/AuthProvider';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/add-agents" element={<AddAgents />} />
              <Route path="/view-hierarchy" element={<ViewHierarchy />} />
              <Route path="/task-management" element={<TaskManagement />} />
              <Route path="/panchayath-notes" element={<PanchayathNotes />} />
              <Route path="/admin/*" element={<AdminPanel />} />
              <Route path="/guest-login" element={<GuestLogin />} />
              <Route path="/team-login" element={<TeamLoginPage />} />
              <Route path="/team-dashboard" element={<TeamDashboard />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
