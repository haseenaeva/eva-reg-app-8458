import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn, UserPlus, Phone, User, AlertCircle, CheckCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GuestRegistrationForm } from "@/components/GuestRegistrationForm";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function GuestLogin() {
  const [loginData, setLoginData] = useState({
    username: '',
    mobileNumber: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'pending' | 'rejected'>('idle');
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    try {
      // Check if user exists and is approved
      const { data, error } = await supabase
        .from('user_registration_requests')
        .select('*')
        .eq('username', loginData.username.trim())
        .eq('mobile_number', loginData.mobileNumber)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { // No rows returned
          toast({
            title: "Error",
            description: "Invalid username or mobile number",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      if (data.status === 'approved') {
        setLoginStatus('success');
        // Store user session
        localStorage.setItem('guest_user', JSON.stringify({
          id: data.id,
          username: data.username,
          mobileNumber: data.mobile_number,
          role: 'guest'
        }));
        
        toast({
          title: "Success",
          description: "Login successful! Redirecting...",
        });

        // Redirect to main app after short delay
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else if (data.status === 'pending') {
        setLoginStatus('pending');
      } else if (data.status === 'rejected') {
        setLoginStatus('rejected');
      }

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loginStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-green-800">Login Successful</CardTitle>
            <CardDescription>
              Welcome! Redirecting you to the dashboard...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" className="flex items-center gap-2">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader className="text-center">
                <CardTitle>Guest Login</CardTitle>
                <CardDescription>
                  Login with your approved username and mobile number
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loginStatus === 'pending' && (
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your registration is still pending admin approval.
                    </AlertDescription>
                  </Alert>
                )}

                {loginStatus === 'rejected' && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your registration request was rejected. Please contact the administrator.
                    </AlertDescription>
                  </Alert>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-username"
                        type="text"
                        placeholder="Enter your username"
                        value={loginData.username}
                        onChange={(e) => setLoginData(prev => ({ ...prev, username: e.target.value }))}
                        className="pl-10"
                        disabled={isLoggingIn}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="login-mobile"
                        type="tel"
                        placeholder="Enter mobile number"
                        value={loginData.mobileNumber}
                        onChange={(e) => setLoginData(prev => ({ ...prev, mobileNumber: e.target.value }))}
                        className="pl-10"
                        maxLength={10}
                        disabled={isLoggingIn}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isLoggingIn}>
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <GuestRegistrationForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}