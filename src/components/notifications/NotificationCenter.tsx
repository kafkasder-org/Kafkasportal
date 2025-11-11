'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Check, CheckCheck, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { toast } from 'sonner';
import { Id } from '@/convex/_generated/dataModel';
import { cn } from '@/lib/utils';

interface NotificationCenterProps {
  userId: Id<'users'>;
}

export function NotificationCenter({ userId }: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Fetch unread count
  const unreadCount = useQuery(api.workflow_notifications.getUnreadCount, {
    recipient: userId,
  });

  // Fetch recent notifications
  const allNotifications = useQuery(api.workflow_notifications.getRecent, {
    recipient: userId,
    limit: 50,
  });

  // Mutations
  const markAsRead = useMutation(api.workflow_notifications.markAsRead);
  const markAllAsRead = useMutation(api.workflow_notifications.markAllAsRead);
  const deleteNotification = useMutation(api.workflow_notifications.remove);

  // Filter notifications based on active tab
  const filteredNotifications = allNotifications?.filter((notification) => {
    if (activeTab === 'unread') {
      return notification.status !== 'okundu';
    }
    return true;
  });

  const handleMarkAsRead = async (notificationId: Id<'workflow_notifications'>) => {
    try {
      await markAsRead({ id: notificationId });
    } catch (error) {
      toast.error('Bildirim güncellenemedi');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead({ recipient: userId });
      toast.success('Tüm bildirimler okundu olarak işaretlendi');
    } catch (error) {
      toast.error('Bildirimler güncellenemedi');
    }
  };

  const handleDelete = async (notificationId: Id<'workflow_notifications'>) => {
    try {
      await deleteNotification({ id: notificationId });
      toast.success('Bildirim silindi');
    } catch (error) {
      toast.error('Bildirim silinemedi');
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'meeting':
        return '📅';
      case 'gorev':
        return '✅';
      case 'rapor':
        return '📊';
      case 'hatirlatma':
        return '⏰';
      default:
        return '📢';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800';
      case 'gorev':
        return 'bg-green-100 text-green-800';
      case 'rapor':
        return 'bg-purple-100 text-purple-800';
      case 'hatirlatma':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount && unreadCount > 0 ? (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Bildirimler</h3>
          <div className="flex items-center gap-2">
            {unreadCount && unreadCount > 0 ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                <CheckCheck className="h-4 w-4 mr-1" />
                Tümünü Okundu İşaretle
              </Button>
            ) : null}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')} className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="all">Tümü</TabsTrigger>
            <TabsTrigger value="unread">
              Okunmamış
              {unreadCount && unreadCount > 0 ? (
                <Badge variant="secondary" className="ml-2">
                  {unreadCount}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="m-0">
            <ScrollArea className="h-[500px]">
              {filteredNotifications && filteredNotifications.length > 0 ? (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      className={cn(
                        'p-4 hover:bg-muted/50 transition-colors',
                        notification.status !== 'okundu' && 'bg-blue-50/50'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <span className="text-2xl">{getCategoryIcon(notification.category)}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{notification.title}</p>
                              {notification.body && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  {notification.body}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <Badge
                                  variant="secondary"
                                  className={cn('text-xs', getCategoryColor(notification.category))}
                                >
                                  {notification.category}
                                </Badge>
                                <span className="text-xs text-muted-foreground">
                                  {format(new Date(notification.created_at), 'dd MMM yyyy, HH:mm', {
                                    locale: tr,
                                  })}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              {notification.status !== 'okundu' && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleMarkAsRead(notification._id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => handleDelete(notification._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4">
                  <Bell className="h-12 w-12 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground text-center">
                    {activeTab === 'unread'
                      ? 'Okunmamış bildiriminiz yok'
                      : 'Henüz bildiriminiz yok'}
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </PopoverContent>
    </Popover>
  );
}
