
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  username: string;
  role: 'super_admin' | 'local_admin' | 'user_admin';
}

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Simple password verification (in production, use proper bcrypt)
      const validCredentials = {
        'evaadmin': { password: 'eva919123', role: 'super_admin' as const },
        'admin1': { password: 'elife9094', role: 'local_admin' as const },
        'admin2': { password: 'penny9094', role: 'user_admin' as const }
      };

      const userCredentials = validCredentials[username as keyof typeof validCredentials];
      
      if (userCredentials && userCredentials.password === password) {
        const loggedInUser: User = {
          id: username,
          username,
          role: userCredentials.role
        };
        
        setUser(loggedInUser);
        localStorage.setItem('admin_user', JSON.stringify(loggedInUser));
        
        toast({
          title: "Success",
          description: "Login successful",
        });
        
        return true;
      } else {
        toast({
          title: "Error",
          description: "Invalid username or password",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "Login failed",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
    toast({
      title: "Success",
      description: "Logged out successfully",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
