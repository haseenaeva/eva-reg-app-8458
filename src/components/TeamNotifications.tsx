import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Users, User, Check, Clock } from "lucide-react";
import { format } from "date-fns";

interface TeamNotification {
  id: string;
  team_id: string;
  agent_mobile: string;
  task_id: string;
  notification_type: 'team_task' | 'individual_task';
  message: string;
  is_read: boolean;
  created_at: string;
  tasks?: {
    title: string;
    description: string;
    priority: string;
    status: string;
  };
}

interface TeamNotificationsProps {
  teamId: string;
  teamName: string;
  mobileNumber: string;
}

export const TeamNotifications = ({ teamId, teamName, mobileNumber }: TeamNotificationsProps) => {
  const [notifications, setNotifications] = useState<TeamNotification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('team-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'team_notifications',
          filter: `team_id=eq.${teamId},agent_mobile=eq.${mobileNumber}`
        },
        (payload) => {
          fetchNotifications(); // Refresh notifications when new one arrives
          toast({
            title: "New Notification",
            description: "You have a new task notification",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamId, mobileNumber]);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('team_notifications')
        .select(`
          *,
          tasks (
            title,
            description,
            priority,
            status
          )
        `)
        .or(`team_id.eq.${teamId},agent_mobile.eq.${mobileNumber}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications((data || []) as TeamNotification[]);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to fetch notifications",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('team_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, is_read: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const teamNotifications = notifications.filter(n => 
    n.notification_type === 'team_task' && n.team_id === teamId
  );
  
  const individualNotifications = notifications.filter(n => 
    n.notification_type === 'individual_task' && n.agent_mobile === mobileNumber
  );

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const NotificationCard = ({ notification }: { notification: TeamNotification }) => (
    <Card className={`mb-4 ${notification.is_read ? 'opacity-75' : 'border-blue-200 bg-blue-50'}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            {notification.notification_type === 'team_task' ? (
              <Users className="h-4 w-4 text-blue-600" />
            ) : (
              <User className="h-4 w-4 text-green-600" />
            )}
            <Badge variant={notification.notification_type === 'team_task' ? 'default' : 'secondary'}>
              {notification.notification_type === 'team_task' ? 'Team Task' : 'Individual Task'}
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            {!notification.is_read && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAsRead(notification.id)}
              >
                <Check className="h-4 w-4" />
              </Button>
            )}
            <span className="text-xs text-gray-500">
              {format(new Date(notification.created_at), 'MMM dd, HH:mm')}
            </span>
          </div>
        </div>
        
        <p className="text-sm mb-2">{notification.message}</p>
        
        {notification.tasks && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-sm mb-1">{notification.tasks.title}</h4>
            <p className="text-xs text-gray-600 mb-2">{notification.tasks.description}</p>
            <div className="flex gap-2">
              <Badge variant="outline" className="text-xs">
                {notification.tasks.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {notification.tasks.status}
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading notifications...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notifications
          {unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Team: {teamName} | Mobile: {mobileNumber}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="team">
              Team ({teamNotifications.length})
            </TabsTrigger>
            <TabsTrigger value="individual">
              Individual ({individualNotifications.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="mt-4">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No notifications found
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="team" className="mt-4">
            {teamNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No team notifications found
              </div>
            ) : (
              teamNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
          
          <TabsContent value="individual" className="mt-4">
            {individualNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No individual notifications found
              </div>
            ) : (
              individualNotifications.map(notification => (
                <NotificationCard key={notification.id} notification={notification} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};