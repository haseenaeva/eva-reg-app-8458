import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { TeamLogin } from '@/components/TeamLogin';
import { useAuth } from '@/components/AuthProvider';

const TeamLoginPage = () => {
  const { teamLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If user is already logged in, redirect appropriately
    if (user) {
      if ('teamName' in user) {
        navigate('/team-dashboard');
      } else {
        navigate('/admin-panel');
      }
    }
  }, [user, navigate]);

  const handleTeamLogin = (teamId: string, teamName: string, mobileNumber: string) => {
    teamLogin(teamId, teamName, mobileNumber);
    navigate('/team-dashboard');
  };

  return <TeamLogin onTeamLogin={handleTeamLogin} />;
};

export default TeamLoginPage;