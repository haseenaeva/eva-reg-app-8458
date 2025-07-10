
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Plus, Eye, CheckSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { AddTaskForm } from "@/components/AddTaskForm";
import { ViewTasks } from "@/components/ViewTasks";

const TaskManagement = () => {
  const [activeTab, setActiveTab] = useState<'add' | 'view'>('add');

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <CheckSquare className="h-8 w-8 text-purple-600" />
            Task Management
          </h1>
          <p className="text-gray-600">Create, assign, and track tasks for your teams and agents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              activeTab === 'add' 
                ? 'ring-2 ring-purple-500 bg-purple-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveTab('add')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Plus className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Add Tasks</CardTitle>
              <CardDescription>Create new tasks and assign them to teams or agents</CardDescription>
            </CardHeader>
          </Card>

          <Card 
            className={`cursor-pointer transition-all duration-200 ${
              activeTab === 'view' 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:shadow-md'
            }`}
            onClick={() => setActiveTab('view')}
          >
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Eye className="h-6 w-6 text-blue-600" />
              </div>
              <CardTitle className="text-lg">View Tasks</CardTitle>
              <CardDescription>View and manage existing tasks, update status and add remarks</CardDescription>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {activeTab === 'add' ? <Plus className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              {activeTab === 'add' ? 'Create New Task' : 'View & Manage Tasks'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'add' 
                ? 'Fill in the details below to create a new task' 
                : 'View all tasks, filter by date, and manage task status'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'add' ? (
              <AddTaskForm />
            ) : (
              <ViewTasks />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskManagement;
