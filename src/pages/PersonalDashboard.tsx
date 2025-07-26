import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, LogOut, User, Phone, MapPin } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

const PersonalDashboard = () => {
  const { user, logout } = useAuth();

  if (!user || user.role !== 'guest') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-6">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Access denied. Please log in as a guest user.</p>
            <Link to="/guest-login">
              <Button className="mt-4">Go to Guest Login</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const guestUser = user as any; // Type assertion since we know it's a guest user

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <Link to="/">
              <Button variant="ghost">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Welcome,</p>
                <p className="font-medium">{guestUser.username}</p>
                <p className="text-sm text-gray-500">Mobile: {guestUser.mobileNumber}</p>
                {guestUser.panchayath && (
                  <p className="text-sm text-gray-500">{guestUser.panchayath.name}, {guestUser.panchayath.district}</p>
                )}
              </div>
              <Button variant="outline" onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <User className="h-8 w-8 text-green-600" />
            Personal Dashboard - {guestUser.username}
          </h1>
          <p className="text-gray-600">Your personal space for individual activities and updates</p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Your account details and registration information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Username</h3>
                    <p className="text-gray-600">{guestUser.username}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-gray-500" />
                  <div>
                    <h3 className="font-medium text-gray-900">Mobile Number</h3>
                    <p className="text-gray-600">{guestUser.mobileNumber}</p>
                  </div>
                </div>
                {guestUser.panchayath && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <div>
                      <h3 className="font-medium text-gray-900">Panchayath</h3>
                      <p className="text-gray-600">
                        {guestUser.panchayath.name}, {guestUser.panchayath.district}, {guestUser.panchayath.state}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-green-500"></div>
                  <div>
                    <h3 className="font-medium text-gray-900">Status</h3>
                    <p className="text-green-600">Active Guest User</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent actions and updates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity to display</p>
                <p className="text-sm mt-2">Your personal activities will appear here</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common actions you can perform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/team-dashboard">
                  <Button variant="outline" className="w-full">
                    Switch to Team Dashboard
                  </Button>
                </Link>
                <Button variant="outline" className="w-full" disabled>
                  View Personal Tasks
                  <span className="text-xs ml-2">(Coming Soon)</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PersonalDashboard;