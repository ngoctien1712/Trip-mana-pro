import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate, formatCurrency } from '@/utils/format';
import { Search, Calendar, User, Package, Ticket, ChevronRight, Eye, Settings2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export const ActivityMonitoring = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [editingItem, setEditingItem] = useState<any>(null);

    const { data: providers, isLoading } = useQuery({
        queryKey: ['admin-activity-providers', search, startDate, endDate],
        queryFn: () => adminApi.listActivityProviders({ search, startDate, endDate }),
    });

    const { data: items, isLoading: isLoadingItems } = useQuery({
        queryKey: ['admin-provider-items', selectedProvider?.id_provider, startDate, endDate],
        queryFn: () => adminApi.getProviderActivityItems(selectedProvider.id_provider, { startDate, endDate }),
        enabled: !!selectedProvider,
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ type, id, status }: any) => adminApi.updateActivityItemStatus(type, id, status),
        onSuccess: () => {
            toast.success('Cập nhật trạng thái thành công');
            queryClient.invalidateQueries({ queryKey: ['admin-provider-items'] });
            queryClient.invalidateQueries({ queryKey: ['admin-activity-providers'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Lỗi khi cập nhật');
        }
    });

    const updateItemMutation = useMutation({
        mutationFn: (item: any) => {
            if (item.type === 'service') {
                return adminApi.updateActivityItemDetails('service', item.id_item, { title: item.title, price: item.price });
            } else {
                return adminApi.updateActivityItemDetails('voucher', item.id_voucher, { name: item.name, discount_value: item.discount_value });
            }
        },
        onSuccess: () => {
            toast.success('Cập nhật thông tin thành công');
            setEditingItem(null);
            queryClient.invalidateQueries({ queryKey: ['admin-provider-items'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Lỗi khi cập nhật');
        }
    });

    return (
        <div className="page-enter">
            <PageHeader
                title="Giám sát hoạt động"
                description="Theo dõi và quản lý các dịch vụ & voucher mới từ đối tác"
            />

            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-card p-4 rounded-lg border shadow-sm">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Tìm theo tên nhà cung cấp..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground ml-2" />
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-40"
                    />
                    <span>đến</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-40"
                    />
                </div>
            </div>

            <Card className="card-elevated">
                <CardHeader>
                    <CardTitle>Danh sách nhà cung cấp có hoạt động</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Chủ sở hữu</TableHead>
                                <TableHead>Loại</TableHead>
                                <TableHead className="text-right">Dịch vụ mới</TableHead>
                                <TableHead className="text-right">Voucher mới</TableHead>
                                <TableHead className="text-right">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
                            ) : providers?.data?.length === 0 ? (
                                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Không tìm thấy hoạt động nào trong khoảng thời gian này</TableCell></TableRow>
                            ) : providers?.data?.map((p: any) => (
                                <TableRow key={p.id_provider}>
                                    <TableCell className="font-bold">{p.name}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2 text-sm">
                                            <User className="h-3 w-3 text-muted-foreground" />
                                            {p.owner_name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="capitalize">{p.service_type}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-primary">
                                        {p.service_count}
                                    </TableCell>
                                    <TableCell className="text-right font-semibold text-orange-600">
                                        {p.voucher_count}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            onClick={() => setSelectedProvider(p)}
                                        >
                                            Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Dialog open={!!selectedProvider} onOpenChange={(open) => !open && setSelectedProvider(null)}>
                <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5" />
                            Hoạt động của: {selectedProvider?.name}
                        </DialogTitle>
                    </DialogHeader>

                    {isLoadingItems ? (
                        <div className="py-20 text-center">Đang tải chi tiết...</div>
                    ) : (
                        <div className="mt-4">
                            <div className="flex items-center gap-4 mb-4 bg-muted/30 p-3 rounded-lg border border-dashed">
                                <div className="text-sm font-medium flex items-center gap-2">
                                    <Calendar className="h-4 w-4" /> Tìm theo ngày:
                                </div>
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-40 h-9"
                                />
                                <span>-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-40 h-9"
                                />
                            </div>

                            <Tabs defaultValue="services">
                                <TabsList className="grid w-full grid-cols-2">
                                    <TabsTrigger value="services" className="flex items-center gap-2">
                                        <Package className="h-4 w-4" /> Dịch vụ ({items?.services?.length || 0})
                                    </TabsTrigger>
                                    <TabsTrigger value="vouchers" className="flex items-center gap-2">
                                        <Ticket className="h-4 w-4" /> Voucher ({items?.vouchers?.length || 0})
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="services" className="border rounded-md mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tên dịch vụ</TableHead>
                                                <TableHead>Giá</TableHead>
                                                <TableHead>Ngày tạo</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Tùy chỉnh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items?.services?.map((s: any) => (
                                                <TableRow key={s.id_item}>
                                                    <TableCell className="font-medium">{s.title}</TableCell>
                                                    <TableCell>{formatCurrency(s.price)}</TableCell>
                                                    <TableCell className="text-xs">{formatDate(s.created_at)}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={s.status === 'active' ? 'default' : 'secondary'}>
                                                            {s.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right flex justify-end gap-2">
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() => navigate(`/admin/services/${s.id_item}`)}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" /> Chi tiết
                                                        </Button>
                                                        {s.status === 'active' ? (
                                                            <Button
                                                                size="xs"
                                                                variant="destructive"
                                                                onClick={() => updateStatusMutation.mutate({ type: 'service', id: s.id_item, status: 'inactive' })}
                                                                disabled={updateStatusMutation.isPending}
                                                            >
                                                                Khóa
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => updateStatusMutation.mutate({ type: 'service', id: s.id_item, status: 'active' })}
                                                                disabled={updateStatusMutation.isPending}
                                                            >
                                                                Duyệt
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {items?.services?.length === 0 && (
                                                <TableRow><TableCell colSpan={5} className="text-center py-4">Không có dịch vụ nào</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>

                                <TabsContent value="vouchers" className="border rounded-md mt-4">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Mã</TableHead>
                                                <TableHead>Tên</TableHead>
                                                <TableHead>Giảm giá</TableHead>
                                                <TableHead>Trạng thái</TableHead>
                                                <TableHead className="text-right">Tùy chỉnh</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {items?.vouchers?.map((v: any) => (
                                                <TableRow key={v.id_voucher}>
                                                    <TableCell className="font-mono text-xs">{v.code}</TableCell>
                                                    <TableCell className="text-sm">{v.name}</TableCell>
                                                    <TableCell className="text-sm">
                                                        {v.discount_type === 'percentage' ? `${v.discount_value}%` : formatCurrency(v.discount_value)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={v.status === 'active' ? 'default' : 'secondary'}>
                                                            {v.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right flex justify-end gap-2">
                                                        <Button
                                                            size="xs"
                                                            variant="outline"
                                                            onClick={() => navigate(`/admin/vouchers/${v.id_voucher}`)}
                                                        >
                                                            <Eye className="h-3 w-3 mr-1" /> Chi tiết
                                                        </Button>
                                                        {v.status === 'active' ? (
                                                            <Button
                                                                size="xs"
                                                                variant="destructive"
                                                                onClick={() => updateStatusMutation.mutate({ type: 'voucher', id: v.id_voucher, status: 'inactive' })}
                                                                disabled={updateStatusMutation.isPending}
                                                            >
                                                                Khóa
                                                            </Button>
                                                        ) : (
                                                            <Button
                                                                size="xs"
                                                                className="bg-green-600 hover:bg-green-700"
                                                                onClick={() => updateStatusMutation.mutate({ type: 'voucher', id: v.id_voucher, status: 'active' })}
                                                                disabled={updateStatusMutation.isPending}
                                                            >
                                                                Mở
                                                            </Button>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                            {items?.vouchers?.length === 0 && (
                                                <TableRow><TableCell colSpan={5} className="text-center py-4">Không có voucher nào</TableCell></TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TabsContent>
                            </Tabs>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editingItem} onOpenChange={(v) => !v && setEditingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Tùy chỉnh: {editingItem?.title || editingItem?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Tên / Tiêu đề</Label>
                            <Input
                                value={editingItem?.title || editingItem?.name || ''}
                                onChange={(e) => setEditingItem({ ...editingItem, [editingItem.type === 'service' ? 'title' : 'name']: e.target.value })}
                            />
                        </div>
                        {editingItem?.type === 'service' && (
                            <div className="space-y-2">
                                <Label>Giá (VND)</Label>
                                <Input
                                    type="number"
                                    value={editingItem?.price || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                />
                            </div>
                        )}
                        {editingItem?.type === 'voucher' && (
                            <div className="space-y-2">
                                <Label>Giá trị giảm</Label>
                                <Input
                                    type="number"
                                    value={editingItem?.discount_value || 0}
                                    onChange={(e) => setEditingItem({ ...editingItem, discount_value: Number(e.target.value) })}
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setEditingItem(null)}>Hủy</Button>
                        <Button
                            onClick={() => updateItemMutation.mutate(editingItem)}
                            disabled={updateItemMutation.isPending}
                        >
                            {updateItemMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                            Lưu thay đổi
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ActivityMonitoring;
