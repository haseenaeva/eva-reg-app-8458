import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, LogIn, UserPlus, Phone, User, AlertCircle, CheckCircle, Users } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { GuestRegistrationForm } from "@/components/GuestRegistrationForm";
import { GuestTaskPopup } from "@/components/GuestTaskPopup";
import { typedSupabase, TABLES } from "@/lib/supabase-utils";
import { useToast } from "@/hooks/use-toast";
export default function GuestLogin() {
  const [loginData, setLoginData] = useState({
    username: '',
    mobileNumber: ''
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginStatus, setLoginStatus] = useState<'idle' | 'success' | 'pending' | 'rejected'>('idle');
  const [showTaskPopup, setShowTaskPopup] = useState(false);
  const [loggedInMobile, setLoggedInMobile] = useState("");
  const [showDashboardChoice, setShowDashboardChoice] = useState(false);
  const [userTeams, setUserTeams] = useState([]);
  const [teamPassword, setTeamPassword] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      // Check if user exists and is approved
      const {
        data,
        error
      } = await typedSupabase.from(TABLES.USER_REGISTRATION_REQUESTS).select('*, panchayaths(name, district, state)').eq('username', loginData.username.trim()).eq('mobile_number', loginData.mobileNumber).single();
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
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
        const userData = {
          id: data.id,
          username: data.username,
          mobileNumber: data.mobile_number,
          panchayath_id: data.panchayath_id,
          panchayath: data.panchayaths,
          role: 'guest'
        };
        
        setLoggedInUser(userData);
        
        // Check if user is part of any management teams
        const { data: teamData, error: teamError } = await typedSupabase
          .from(TABLES.MANAGEMENT_TEAM_MEMBERS)
          .select(`
            *, 
            management_teams(*)
          `)
          .eq('agent_id', data.id);

        if (!teamError && teamData && teamData.length > 0) {
          setUserTeams(teamData);
          setShowDashboardChoice(true);
        } else {
          // No teams found, go directly to personal dashboard
          localStorage.setItem('guest_user', JSON.stringify(userData));
          setLoginStatus('success');
          setTimeout(() => {
            navigate('/personal-dashboard');
          }, 1000);
        }
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

  const handlePersonalDashboard = () => {
    localStorage.setItem('guest_user', JSON.stringify(loggedInUser));
    setLoginStatus('success');
    setTimeout(() => {
      navigate('/personal-dashboard');
    }, 500);
  };

  const handleTeamDashboard = async (team) => {
    setSelectedTeam(team);
  };

  const handleTeamPasswordSubmit = async () => {
    if (!selectedTeam || !teamPassword) {
      toast({
        title: "Error",
        description: "Please enter the team password",
        variant: "destructive"
      });
      return;
    }

    try {
      // Verify team password
      const { data: teamData, error } = await typedSupabase
        .from(TABLES.MANAGEMENT_TEAMS)
        .select('*')
        .eq('id', selectedTeam.team_id)
        .eq('team_password', teamPassword)
        .single();

      if (error || !teamData) {
        toast({
          title: "Error",
          description: "Invalid team password",
          variant: "destructive"
        });
        return;
      }

      // Store team user session
      localStorage.setItem('team_user', JSON.stringify({
        id: `${selectedTeam.team_id}_${loggedInUser.mobileNumber}`,
        teamId: selectedTeam.team_id,
        teamName: selectedTeam.management_teams.name,
        mobileNumber: loggedInUser.mobileNumber,
        role: 'team_member'
      }));

      setLoginStatus('success');
      setTimeout(() => {
        navigate('/team-dashboard');
      }, 500);
    } catch (error) {
      console.error('Team login error:', error);
      toast({
        title: "Error",
        description: "Failed to verify team credentials",
        variant: "destructive"
      });
    }
  };
  if (showDashboardChoice) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <CardTitle>Choose Dashboard</CardTitle>
            <CardDescription>
              Select which dashboard you want to access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedTeam ? (
              <div className="space-y-4">
                <h3 className="font-medium">Enter Team Password for {selectedTeam.management_teams.name}</h3>
                <Input
                  type="password"
                  placeholder="Team Password"
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={handleTeamPasswordSubmit} className="flex-1">
                    Access Team Dashboard
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedTeam(null)}>
                    Back
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Button 
                  onClick={handlePersonalDashboard}
                  className="w-full"
                  variant="outline"
                >
                  <User className="mr-2 h-4 w-4" />
                  Personal Dashboard
                </Button>
                
                {userTeams.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">Or access team dashboard:</p>
                    {userTeams.map((teamMember) => (
                      <Button 
                        key={teamMember.id}
                        onClick={() => handleTeamDashboard(teamMember)}
                        className="w-full"
                        variant="default"
                      >
                        <Users className="mr-2 h-4 w-4" />
                        {teamMember.management_teams.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loginStatus === 'success') {
    return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
      </div>;
  }
  return <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
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
            <TabsTrigger value="login" className="flex items-center gap-2 bg-green-700 hover:bg-green-600 text-slate-50">
              <LogIn className="h-4 w-4" />
              Login
            </TabsTrigger>
            <TabsTrigger value="register" className="flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-slate-50">
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
                {loginStatus === 'pending' && <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your registration is still pending admin approval.
                    </AlertDescription>
                  </Alert>}

                {loginStatus === 'rejected' && <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your registration request was rejected. Please contact the administrator.
                    </AlertDescription>
                  </Alert>}

                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-username">Username</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="login-username" type="text" placeholder="Enter your username" value={loginData.username} onChange={e => setLoginData(prev => ({
                      ...prev,
                      username: e.target.value
                    }))} className="pl-10" disabled={isLoggingIn} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="login-mobile">Mobile Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input id="login-mobile" type="tel" placeholder="Enter mobile number" value={loginData.mobileNumber} onChange={e => setLoginData(prev => ({
                      ...prev,
                      mobileNumber: e.target.value
                    }))} className="pl-10" maxLength={10} disabled={isLoggingIn} />
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

    </div>;
}