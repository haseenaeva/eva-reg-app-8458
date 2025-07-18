import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Settings, UserPlus } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow-md border-b">
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            Panchayath Management System
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/admin-panel">
              <Button 
                variant={location.pathname === '/admin-panel' ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Settings className="h-4 w-4" />
                Admin Panel
              </Button>
            </Link>
            
            <Link to="/guest-login">
              <Button 
                variant={location.pathname === '/guest-login' ? 'default' : 'ghost'}
                className="flex items-center gap-2"
              >
                <UserPlus className="h-4 w-4" />
                Guest Access
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};