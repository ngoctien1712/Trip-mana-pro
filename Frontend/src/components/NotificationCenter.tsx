import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '@/api/notification.api';
import { Bell, Check, Trash2, MailOpen } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDate } from '@/utils/format';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const NotificationCenter = () => {
    const queryClient = useQueryClient();
    const { data: notifications, isLoading } = useQuery({
        queryKey: ['notifications'],
        queryFn: () => notificationApi.list(),
        refetchInterval: 15000, // Faster: Refetch every 15s
    });

    const markReadMutation = useMutation({
        mutationFn: (id: string) => notificationApi.markRead(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
        }
    });

    const markAllReadMutation = useMutation({
        mutationFn: () => notificationApi.markAllRead(),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            toast.success('Đã đánh dấu tất cả là đã đọc');
        }
    });

    const unreadCount = notifications?.data?.filter((n: any) => !n.is_read).length || 0;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 transition-colors">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white shadow-sm ring-2 ring-white animate-in zoom-in duration-300">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[380px] p-0 shadow-2xl border-none overflow-hidden rounded-2xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-primary/5 to-transparent">
                    <div>
                        <h4 className="text-sm font-bold flex items-center gap-2">
                            Thông báo
                            <Badge variant="secondary" className="h-5 px-1.5 font-black text-[10px] bg-primary/10 text-primary">
                                {unreadCount} mới
                            </Badge>
                        </h4>
                    </div>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs font-bold text-primary hover:text-primary/70 transition-colors"
                            onClick={() => markAllReadMutation.mutate()}
                        >
                            Đánh dấu tất cả
                        </Button>
                    )}
                </div>
                <DropdownMenuSeparator className="m-0" />
                <ScrollArea className="h-96">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-3">
                            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                            <p className="text-xs text-muted-foreground font-medium">Đang tải thông báo...</p>
                        </div>
                    ) : !notifications?.data?.length ? (
                        <div className="flex flex-col items-center justify-center h-64 text-center px-8">
                            <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                <MailOpen className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                            <h5 className="font-bold text-sm mb-1">Bạn chưa có thông báo</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                Khi có tin mới về thanh toán hoặc đặt lịch, chúng tôi sẽ báo cho bạn ngay.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-muted/30">
                            {notifications.data.map((n: any) => (
                                <div
                                    key={n.id_notification}
                                    className={cn(
                                        "p-4 hover:bg-muted/50 cursor-pointer transition-all duration-200 relative group flex gap-4",
                                        !n.is_read && "bg-primary/[0.03] hover:bg-primary/[0.05]"
                                    )}
                                    onClick={() => !n.is_read && markReadMutation.mutate(n.id_notification)}
                                >
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                        n.type === 'success' ? "bg-green-100 text-green-600" :
                                        n.type === 'error' ? "bg-red-100 text-red-600" :
                                        n.type === 'warning' ? "bg-yellow-100 text-yellow-600" :
                                        "bg-blue-100 text-blue-600"
                                    )}>
                                        <Bell className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start gap-2">
                                            <p className={cn("text-xs leading-tight line-clamp-1", !n.is_read ? "font-black text-foreground" : "font-medium text-muted-foreground")}>
                                                {n.title}
                                            </p>
                                            {!n.is_read && <div className="h-2 w-2 rounded-full bg-primary mt-1 shrink-0 shadow-sm shadow-primary/50" />}
                                        </div>
                                        <p className={cn("text-[11px] leading-relaxed line-clamp-2", !n.is_read ? "text-muted-foreground font-medium" : "text-muted-foreground/70")}>
                                            {n.message}
                                        </p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-[9px] font-bold text-muted-foreground/60 uppercase tracking-tighter">
                                                {formatDate(n.created_at)}
                                            </span>
                                            {!n.is_read && (
                                                <span className="text-[9px] font-black text-primary uppercase tracking-tighter italic">mới</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
                <div className="p-3 bg-muted/20 border-t flex justify-center">
                    <Button variant="ghost" size="sm" className="w-full text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors">
                        Xem tất cả lịch sử ứng dụng
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
