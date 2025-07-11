import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckSquare, Plus, Settings, TreePine, UserPlus } from "lucide-react";
import { Link } from 'react-router-dom';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-6xl mx-auto py-6 px-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Panchayath Management System
          </h1>
          <p className="text-gray-600">
            Streamline operations, enhance transparency, and empower communities
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Add Agents & Panchayaths */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <UserPlus className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                Add Agents & Panchayaths
              </CardTitle>
              <CardDescription className="text-gray-600">
                Register new agents and define panchayath boundaries for efficient management
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/add-agents">
                <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  Add New Agents
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* View Hierarchy */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-green-500 to-teal-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TreePine className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors">
                View Hierarchy
              </CardTitle>
              <CardDescription className="text-gray-600">
                Visualize organizational structure and agent relationships in interactive charts
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/view-hierarchy">
                <Button className="w-full bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  View Organization Chart
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Task Management */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <CheckSquare className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-purple-600 transition-colors">
                Task Management
              </CardTitle>
              <CardDescription className="text-gray-600">
                Create, assign, and track tasks for teams and individual agents
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/task-management">
                <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  Manage Tasks
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white border-0 shadow-lg">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gradient-to-r from-gray-500 to-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Settings className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-gray-800 group-hover:text-gray-600 transition-colors">
                Admin Panel
              </CardTitle>
              <CardDescription className="text-gray-600">
                Manage system settings, teams, and administrative configurations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link to="/admin-panel">
                <Button className="w-full bg-gradient-to-r from-gray-500 to-gray-700 hover:from-gray-600 hover:to-gray-800 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300">
                  Access Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Index;
