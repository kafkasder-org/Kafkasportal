'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Plus,
  Calendar as CalendarIcon,
  List,
  Filter,
  X,
  Edit,
  Trash2,
  Users,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { convexApiClient as api } from '@/lib/api/convex-api-client';
import { useAuthStore } from '@/stores/authStore';
import dynamic from 'next/dynamic';

const MeetingForm = dynamic(() => import('@/components/forms/MeetingForm').then(mod => ({ default: mod.MeetingForm })), {
  loading: () => <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>,
  ssr: false,
});
import { CalendarView } from '@/components/meetings/CalendarView';
import type { MeetingDocument } from '@/types/database';
import { meetingTypeLabels, meetingStatusLabels } from '@/lib/validations/meeting';

export default function MeetingsPage() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // View mode state
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');

  // Search and filter state
  const [search, setSearch] = useState('');
  const [_page, _setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [meetingTypeFilter, setMeetingTypeFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<'all' | 'invited' | 'attended' | 'informed' | 'open'>(
    'all'
  );

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingDocument | null>(null);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const limit = 20;

  // Fetch meetings for list view
  const { data: _meetingsResponse, isLoading: _isLoadingMeetings } = useQuery({
    queryKey: ['meetings', _page, search, statusFilter, meetingTypeFilter, dateFrom, dateTo],
    queryFn: () =>
      api.meetings.getMeetings({
        page: _page,
        limit,
        search,
        filters: {
          status: statusFilter !== 'all' ? statusFilter : undefined,
          meeting_type: meetingTypeFilter !== 'all' ? meetingTypeFilter : undefined,
          date_from: dateFrom ? dateFrom.toISOString() : undefined,
          date_to: dateTo ? dateTo.toISOString() : undefined,
        },
      }),
    enabled: viewMode === 'list',
  });

  // Fetch meetings for calendar view (current month)
  const currentMonth = new Date();
  const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

  const { data: calendarMeetingsResponse, isLoading: isLoadingCalendar } = useQuery({
    queryKey: ['meetings-calendar', monthStart, monthEnd],
    queryFn: () =>
      api.meetings.getMeetings({
        limit: 1000,
        filters: {
          date_from: monthStart.toISOString(),
          date_to: monthEnd.toISOString(),
        },
      }),
    enabled: viewMode === 'calendar',
  });

  // Fetch meetings by tab
  const { data: tabMeetingsResponse, isLoading: isLoadingTab } = useQuery({
    queryKey: ['meetings-tab', activeTab, user?.id],
    queryFn: () => {
      if (!user?.id) return Promise.resolve({ data: [], error: null });
      if (activeTab === 'all') {
        return api.meetings.getMeetings({});
      }
      return api.meetings.getMeetings({
        filters: { status: activeTab as MeetingDocument['status'] },
      });
    },
    enabled: viewMode === 'list' && !!user?.id,
  });

  // Get stats
  const { data: statsResponse } = useQuery({
    queryKey: ['meetings-stats'],
    queryFn: async () => {
      const [total, scheduled, ongoing, completed] = await Promise.all([
        api.meetings.getMeetings({ limit: 1 }),
        api.meetings.getMeetings({ filters: { status: 'scheduled' }, limit: 1 }),
        api.meetings.getMeetings({ filters: { status: 'ongoing' }, limit: 1 }),
        api.meetings.getMeetings({ filters: { status: 'completed' }, limit: 1 }),
      ]);
      return {
        total: total.total || 0,
        scheduled: scheduled.total || 0,
        ongoing: ongoing.total || 0,
        completed: completed.total || 0,
      };
    },
  });

  const _meetings = _meetingsResponse?.data || [];
  const calendarMeetings = calendarMeetingsResponse?.data || [];
  const tabMeetings = tabMeetingsResponse?.data || [];
  const total = _meetingsResponse?.total || 0;
  const _totalPages = Math.ceil(total / limit);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.meetings.deleteMeeting(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['meetings'] });
      queryClient.invalidateQueries({ queryKey: ['meetings-stats'] });
      toast.success('Toplantı başarıyla silindi');
      setMeetingToDelete(null);
    },
    onError: (error: Error) => {
      toast.error(`Toplantı silinirken hata oluştu: ${error.message}`);
    },
  });

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    setSelectedMeeting(null);
    setSelectedDate(undefined);
  };

  const handleMeetingClick = (meeting: MeetingDocument) => {
    setSelectedMeeting(meeting);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setShowCreateModal(true);
  };

  const handleDelete = (id: string) => {
    setMeetingToDelete(id);
  };

  const confirmDelete = () => {
    if (meetingToDelete) {
      deleteMutation.mutate(meetingToDelete);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setMeetingTypeFilter('all');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'default';
      case 'ongoing':
        return 'secondary';
      case 'completed':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'default';
    }
  };

  const getMeetingTypeColor = (type: string) => {
    switch (type) {
      case 'general':
        return 'bg-blue-100 text-blue-800';
      case 'committee':
        return 'bg-purple-100 text-purple-800';
      case 'board':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Toplantı Yönetimi</h1>
          <p className="text-gray-500">Toplantıları planlayın, yönetin ve takip edin</p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex rounded-md border">
            <Button
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('calendar')}
            >
              <CalendarIcon className="h-4 w-4 mr-1" />
              Takvim
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4 mr-1" />
              Liste
            </Button>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Toplantı
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Toplam Toplantı</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statsResponse?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Planlanmış</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{statsResponse?.scheduled || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">Devam Eden</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{statsResponse?.ongoing || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{statsResponse?.completed || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Input
                placeholder="Toplantı başlığı ile ara"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="space-y-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="scheduled">Planlandı</SelectItem>
                  <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="cancelled">İptal Edildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Select value={meetingTypeFilter} onValueChange={setMeetingTypeFilter}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="general">Genel</SelectItem>
                  <SelectItem value="committee">Komite</SelectItem>
                  <SelectItem value="board">Yönetim Kurulu</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters} className="h-9">
                <X className="mr-1 h-4 w-4" />
                Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <>
          {isLoadingCalendar ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
                  <p className="text-gray-500">Toplantılar yükleniyor...</p>
                </div>
              </CardContent>
            </Card>
          ) : calendarMeetings.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-gray-500">Bu ay için planlanmış toplantı yok</p>
              </CardContent>
            </Card>
          ) : (
            <CalendarView
              meetings={calendarMeetings}
              onMeetingClick={handleMeetingClick}
              onDateClick={handleDateClick}
            />
          )}
        </>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Toplantı Listesi</CardTitle>
              <div className="text-sm text-gray-500">{total} Toplantı</div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="invited">Davet</TabsTrigger>
                <TabsTrigger value="attended">Katılım</TabsTrigger>
                <TabsTrigger value="informed">Bilgi Verilenler</TabsTrigger>
                <TabsTrigger value="open">Açık Durumdakiler</TabsTrigger>
              </TabsList>

              {/* Invited Tab */}
              <TabsContent value="invited">
                {isLoadingTab ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : tabMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Henüz davet edildiğiniz bir toplantı bulunmamaktadır
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tabMeetings.map((meeting) => (
                      <Card
                        key={meeting._id}
                        className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', {
                                    locale: tr,
                                  })}
                                </span>
                                <h4 className="font-semibold">{meeting.title}</h4>
                                <Badge className={getMeetingTypeColor(meeting.meeting_type)}>
                                  {meetingTypeLabels[meeting.meeting_type]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {meeting.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{meeting.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{meeting.participants.length} katılımcı</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(meeting.status)}>
                                {meetingStatusLabels[meeting.status]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMeetingClick(meeting);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(meeting._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Attended Tab */}
              <TabsContent value="attended">
                {isLoadingTab ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : tabMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Katılım sağladığınız toplantı bulunmamaktadır
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tabMeetings.map((meeting) => (
                      <Card
                        key={meeting._id}
                        className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', {
                                    locale: tr,
                                  })}
                                </span>
                                <h4 className="font-semibold">{meeting.title}</h4>
                                <Badge className={getMeetingTypeColor(meeting.meeting_type)}>
                                  {meetingTypeLabels[meeting.meeting_type]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {meeting.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{meeting.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{meeting.participants.length} katılımcı</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(meeting.status)}>
                                {meetingStatusLabels[meeting.status]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMeetingClick(meeting);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(meeting._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Informed Tab */}
              <TabsContent value="informed">
                {isLoadingTab ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : tabMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Bilgi verildiğiniz toplantı bulunmamaktadır
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tabMeetings.map((meeting) => (
                      <Card
                        key={meeting._id}
                        className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', {
                                    locale: tr,
                                  })}
                                </span>
                                <h4 className="font-semibold">{meeting.title}</h4>
                                <Badge className={getMeetingTypeColor(meeting.meeting_type)}>
                                  {meetingTypeLabels[meeting.meeting_type]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {meeting.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{meeting.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{meeting.participants.length} katılımcı</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant={getStatusColor(meeting.status)}>
                              {meetingStatusLabels[meeting.status]}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Open Tab */}
              <TabsContent value="open">
                {isLoadingTab ? (
                  <div className="text-center py-8">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto" />
                  </div>
                ) : tabMeetings.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Açık durumda toplantı bulunmamaktadır
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tabMeetings.map((meeting) => (
                      <Card
                        key={meeting._id}
                        className="cursor-pointer transition-all hover:shadow-md hover:bg-blue-50"
                        onClick={() => handleMeetingClick(meeting)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">
                                  {format(new Date(meeting.meeting_date), 'dd MMM yyyy HH:mm', {
                                    locale: tr,
                                  })}
                                </span>
                                <h4 className="font-semibold">{meeting.title}</h4>
                                <Badge className={getMeetingTypeColor(meeting.meeting_type)}>
                                  {meetingTypeLabels[meeting.meeting_type]}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-gray-600">
                                {meeting.location && (
                                  <div className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    <span>{meeting.location}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Users className="h-3 w-3" />
                                  <span>{meeting.participants.length} katılımcı</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant={getStatusColor(meeting.status)}>
                                {meetingStatusLabels[meeting.status]}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMeetingClick(meeting);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(meeting._id);
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Yeni Toplantı Oluştur</DialogTitle>
          </DialogHeader>
          <MeetingForm
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateModal(false)}
            initialData={
              selectedDate
                ? {
                    meeting_date: selectedDate.toISOString(),
                  }
                : undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!selectedMeeting} onOpenChange={(open) => !open && setSelectedMeeting(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Toplantıyı Düzenle</DialogTitle>
          </DialogHeader>
          {selectedMeeting && (
            <MeetingForm
              meetingId={selectedMeeting._id}
              initialData={{
                title: selectedMeeting.title,
                description: selectedMeeting.description,
                meeting_date: selectedMeeting.meeting_date,
                location: selectedMeeting.location,
                meeting_type: selectedMeeting.meeting_type,
                organizer: selectedMeeting.organizer,
                participants: selectedMeeting.participants,
                status: selectedMeeting.status,
                agenda: selectedMeeting.agenda,
                notes: selectedMeeting.notes,
              }}
              onSuccess={() => {
                setSelectedMeeting(null);
                // Refresh meetings list
                queryClient.invalidateQueries({ queryKey: ['meetings'] });
                queryClient.invalidateQueries({ queryKey: ['meetings-calendar'] });
                queryClient.invalidateQueries({ queryKey: ['meetings-stats'] });
                queryClient.invalidateQueries({ queryKey: ['meetings-tab'] });
              }}
              onCancel={() => setSelectedMeeting(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!meetingToDelete}
        onOpenChange={(open) => !open && setMeetingToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Toplantıyı Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu toplantıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-500 hover:bg-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
