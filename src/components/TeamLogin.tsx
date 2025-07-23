import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Users, LogIn } from "lucide-react";

interface ManagementTeam {
  id: string;
  name: string;
  description: string;
  team_password: string;
}

interface TeamLoginProps {
  onTeamLogin: (teamId: string, teamName: string, mobileNumber: string) => void;
}

export const TeamLogin = ({ onTeamLogin }: TeamLoginProps) => {
  const [teams, setTeams] = useState<ManagementTeam[]>([]);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [password, setPassword] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('management_teams')
        .select('*')
        .not('team_password', 'is', null)
        .order('name');

      if (error) throw error;
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive",
      });
    }
  };

  const validateMobileNumber = (mobile: string) => {
    const mobileRegex = /^[6-9]\d{9}$/;
    return mobileRegex.test(mobile);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedTeam || !password || !mobileNumber) {
      toast({
        title: "Error",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    if (!validateMobileNumber(mobileNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit mobile number",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Find the selected team
      const team = teams.find(t => t.id === selectedTeam);
      if (!team) {
        throw new Error('Team not found');
      }

      // Verify password
      if (team.team_password !== password) {
        toast({
          title: "Error",
          description: "Invalid team password",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Check if mobile number is registered with any agent
      const { data: agentData, error: agentError } = await supabase
        .from('agents')
        .select('id, name, phone')
        .eq('phone', mobileNumber)
        .single();

      if (agentError || !agentData) {
        toast({
          title: "Error",
          description: "Mobile number not registered in the system",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      toast({
        title: "Success",
        description: `Welcome to ${team.name} team, ${agentData.name}!`,
      });

      onTeamLogin(team.id, team.name, mobileNumber);
    } catch (error) {
      console.error('Team login error:', error);
      toast({
        title: "Error",
        description: "Team login failed",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Users className="h-12 w-12 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Team Login</CardTitle>
          <CardDescription>
            Login with your team credentials and registered mobile number
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="team">Select Team</Label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your team" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="password">Team Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter team password"
                required
              />
            </div>

            <div>
              <Label htmlFor="mobile">Registered Mobile Number</Label>
              <Input
                id="mobile"
                type="tel"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your 10-digit mobile number"
                maxLength={10}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              <LogIn className="mr-2 h-4 w-4" />
              {isLoading ? "Signing in..." : "Sign In to Team"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};