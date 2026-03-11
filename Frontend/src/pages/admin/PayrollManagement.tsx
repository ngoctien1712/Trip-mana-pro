import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { formatCurrency, formatDate } from '@/utils/format';
import { toast } from 'sonner';
import { Wallet, CheckCircle2, ChevronRight, Calculator, Landmark, History, Search, FileText, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export const PayrollManagement = () => {
    const queryClient = useQueryClient();
    const [selectedProvider, setSelectedProvider] = useState<any>(null);
    const [transactionProof, setTransactionProof] = useState('');
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);

    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-payroll-stats'],
        queryFn: () => adminApi.getPayrollStats(),
        refetchInterval: 15000,
    });

    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ['admin-payroll-history'],
        queryFn: () => adminApi.getPayrollHistory(),
    });

    const { data: paidOrders, isLoading: isLoadingPaidOrders } = useQuery({
        queryKey: ['admin-paid-orders-history'],
        queryFn: () => adminApi.getPaidOrdersHistory(),
    });

    const { data: providerOrders, isLoading: isLoadingOrders } = useQuery({
        queryKey: ['admin-provider-orders', selectedProvider?.id_provider],
        queryFn: () => adminApi.getProviderOrdersForPayroll(selectedProvider.id_provider),
        enabled: !!selectedProvider,
    });

    // Reset selection when dialog opens or orders change
    useEffect(() => {
        if (isDetailOpen && providerOrders?.data) {
            setSelectedOrderIds(providerOrders.data.map((o: any) => o.id_order));
        } else {
            setSelectedOrderIds([]);
        }
    }, [isDetailOpen, providerOrders]);

    const payrollMutation = useMutation({
        mutationFn: (data: any) => adminApi.processPayroll(data),
        onSuccess: () => {
            toast.success('Đã xác nhận thanh toán thành công');
            setIsDetailOpen(false);
            setSelectedProvider(null);
            setTransactionProof('');
            queryClient.invalidateQueries({ queryKey: ['admin-payroll-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-payroll-history'] });
            queryClient.invalidateQueries({ queryKey: ['admin-paid-orders-history'] });
            queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        },
        onError: (err: any) => {
            toast.error(err.message || 'Lỗi khi xử lý thanh toán');
        }
    });

    const toggleOrder = (orderId: string) => {
        setSelectedOrderIds(prev => 
            prev.includes(orderId) 
                ? prev.filter(id => id !== orderId) 
                : [...prev, orderId]
        );
    };

    const toggleAll = () => {
        if (!providerOrders?.data) return;
        if (selectedOrderIds.length === providerOrders.data.length) {
            setSelectedOrderIds([]);
        } else {
            setSelectedOrderIds(providerOrders.data.map((o: any) => o.id_order));
        }
    };

    const calculateSelectedTotals = () => {
        if (!providerOrders?.data) return { total: 0, commission: 0 };
        const selected = providerOrders.data.filter((o: any) => selectedOrderIds.includes(o.id_order));
        return {
            total: selected.reduce((sum: number, o: any) => sum + Number(o.owner_amount), 0),
            commission: selected.reduce((sum: number, o: any) => sum + Number(o.commission_amount), 0)
        };
    };

    const handleProcessPayroll = () => {
        if (!selectedProvider || selectedOrderIds.length === 0) {
            toast.warning('Vui lòng chọn ít nhất một hóa đơn để thanh toán');
            return;
        }

        const totals = calculateSelectedTotals();
        payrollMutation.mutate({
            providerId: selectedProvider.id_provider,
            orderIds: selectedOrderIds,
            totalAmount: totals.total,
            commissionTotal: totals.commission,
            transactionProof
        });
    };

    const totals = calculateSelectedTotals();

    return (
        <div className="page-enter space-y-8">
            <PageHeader
                title="Quản lý lương đối tác"
                description="Thanh toán doanh thu cho các nhà cung cấp dịch vụ"
            />

            <Tabs defaultValue="pending" className="space-y-6">
                <TabsList className="bg-muted p-1 rounded-xl">
                    <TabsTrigger value="pending" className="flex items-center gap-2 rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <Wallet className="h-4 w-4" />
                        Chờ quyết toán
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2 rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <History className="h-4 w-4" />
                        Lịch sử giao dịch
                    </TabsTrigger>
                    <TabsTrigger value="stats" className="flex items-center gap-2 rounded-lg py-2 px-6 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        <BarChart3 className="h-4 w-4" />
                        Thống kê dịch vụ
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="pending" className="space-y-6">
                    <Card className="card-elevated border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-primary">
                                <Wallet className="h-5 w-5" />
                                Bảng quyết toán hiện tại
                            </CardTitle>
                            <CardDescription>Các nhà cung cấp có doanh thu mới chưa được thanh toán.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nhà cung cấp</TableHead>
                                        <TableHead>Thông tin ngân hàng</TableHead>
                                        <TableHead className="text-right">Số đơn chờ</TableHead>
                                        <TableHead className="text-right">Tổng tiền cần trả</TableHead>
                                        <TableHead className="text-right">Thao tác</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoading ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-8">Đang tải...</TableCell></TableRow>
                                    ) : stats?.data?.length === 0 ? (
                                        <TableRow><TableCell colSpan={5} className="text-center py-20 text-muted-foreground font-medium italic text-lg">Hệ thống đang ở trạng thái cân bằng. Không có nợ lương.</TableCell></TableRow>
                                    ) : stats?.data?.map((p: any) => (
                                        <TableRow key={p.id_provider} className="hover:bg-primary/5 transition-colors">
                                            <TableCell className="font-bold text-foreground">{p.name}</TableCell>
                                            <TableCell>
                                                <div className="text-xs space-y-0.5">
                                                    <p className="font-bold flex items-center gap-1"><Landmark className="h-3 w-3" /> {p.bank_name}</p>
                                                    <p className="text-primary font-mono">{p.bank_account_number}</p>
                                                    <p className="text-muted-foreground uppercase">{p.bank_account_name}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="secondary" className="px-3">{p.pending_orders}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-primary text-lg">
                                                {formatCurrency(p.total_pending_amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    size="sm"
                                                    className="shadow-sm"
                                                    onClick={() => {
                                                        setSelectedProvider(p);
                                                        setIsDetailOpen(true);
                                                    }}
                                                >
                                                    <Calculator className="h-4 w-4 mr-2" />
                                                    Quyết toán
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="history">
                    <Card className="card-elevated">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="flex items-center gap-2">
                                    <History className="h-5 w-5 text-blue-500" />
                                    Lịch sử giao dịch chuyển lương
                                </CardTitle>
                                <CardDescription>Bảng tổng hợp các đợt chuyển khoản thực tế cho đối tác.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Ngày thực hiện</TableHead>
                                        <TableHead>Nhà cung cấp</TableHead>
                                        <TableHead>Số lượng đơn</TableHead>
                                        <TableHead className="text-right">Tiền đối tác (85%)</TableHead>
                                        <TableHead className="text-right">Hoa hồng (15%)</TableHead>
                                        <TableHead className="text-right">Mã đối soát</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingHistory ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">Đang tải...</TableCell></TableRow>
                                    ) : history?.data?.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">Chưa có giao dịch nào được ghi nhận.</TableCell></TableRow>
                                    ) : history?.data?.map((h: any) => (
                                        <TableRow key={h.id_payroll}>
                                            <TableCell className="text-xs font-medium">{formatDate(h.created_at)}</TableCell>
                                            <TableCell className="font-medium text-foreground">{h.provider_name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{h.order_count} đơn hàng</Badge>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-green-600">{formatCurrency(h.amount)}</TableCell>
                                            <TableCell className="text-right text-muted-foreground font-medium">{formatCurrency(h.commission_total)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-1 text-xs text-blue-600 font-mono">
                                                    <FileText className="h-3 w-3" />
                                                    {h.transaction_proof || 'AUTO_GEN'}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="stats">
                    <Card className="card-elevated">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5 text-orange-500" />
                                Chi tiết dịch vụ đã quyết toán
                            </CardTitle>
                            <CardDescription>Báo cáo chi trả trên từng đầu dịch vụ/đơn hàng riêng lẻ.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead>Mã đơn</TableHead>
                                        <TableHead>Tên dịch vụ</TableHead>
                                        <TableHead>Đối tác</TableHead>
                                        <TableHead>Ngày thanh toán</TableHead>
                                        <TableHead className="text-right">Tổng giá trị</TableHead>
                                        <TableHead className="text-right">Đã trả (85%)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {isLoadingPaidOrders ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-8">Đang thống kê...</TableCell></TableRow>
                                    ) : paidOrders?.data?.length === 0 ? (
                                        <TableRow><TableCell colSpan={6} className="text-center py-12 text-muted-foreground italic">Dữ liệu thống kê đang được xử lý.</TableCell></TableRow>
                                    ) : paidOrders?.data?.map((o: any) => (
                                        <TableRow key={o.id_order}>
                                            <TableCell className="font-mono text-xs font-bold text-primary">#{o.order_code}</TableCell>
                                            <TableCell className="font-medium text-xs">{o.service_name}</TableCell>
                                            <TableCell className="text-xs">{o.provider_name}</TableCell>
                                            <TableCell className="text-xs">{formatDate(o.paid_at)}</TableCell>
                                            <TableCell className="text-right text-xs">{formatCurrency(o.total_amount)}</TableCell>
                                            <TableCell className="text-right font-bold text-green-600 italic">
                                                {formatCurrency(o.owner_amount)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Selection Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0">
                    <DialogHeader className="p-6 border-b">
                        <DialogTitle className="text-2xl flex items-center gap-2">
                           Quyết toán dịch vụ: <span className="text-primary">{selectedProvider?.name}</span>
                        </DialogTitle>
                    </DialogHeader>

                    {isLoadingOrders ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                            <p className="text-muted-foreground">Đang tải danh sách các dịch vụ từ nhà cung cấp...</p>
                        </div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <Card className="md:col-span-2 bg-muted/30 border-none shadow-none">
                                    <CardContent className="p-4 space-y-3">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground font-bold">Thông tin thanh toán thụ hưởng</Label>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Ngân hàng</p>
                                                <p className="font-bold flex items-center gap-2">
                                                    <Landmark className="h-4 w-4 text-primary" />
                                                    {selectedProvider?.bank_name}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-sm text-muted-foreground">Số tài khoản</p>
                                                <p className="text-lg font-mono font-bold">{selectedProvider?.bank_account_number}</p>
                                            </div>
                                            <div className="space-y-1 col-span-2">
                                                <p className="text-sm text-muted-foreground">Chủ tài khoản</p>
                                                <p className="font-bold uppercase tracking-wide">{selectedProvider?.bank_account_name}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-primary/5 border-primary/20 shadow-none border-2">
                                    <CardContent className="p-4 space-y-4">
                                        <Label className="text-xs uppercase tracking-wider text-primary font-bold">Tổng quyết toán đã chọn</Label>
                                        <div className="space-y-1">
                                            <p className="text-4xl font-black text-primary leading-none">
                                                {formatCurrency(totals.total)}
                                            </p>
                                            <p className="text-xs text-muted-foreground font-medium">
                                                Dựa trên {selectedOrderIds.length} hạng mục dịch vụ/đơn hàng.
                                            </p>
                                        </div>
                                        <div className="pt-2 border-t border-primary/10 flex justify-between items-center text-sm">
                                            <span className="text-muted-foreground">Hoa hồng Admin:</span>
                                            <span className="font-bold text-orange-600">{formatCurrency(totals.commission)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-bold text-lg">Danh sách các dịch vụ & đơn hàng đang chờ</h4>
                                    <div className="flex items-center gap-2">
                                        <Checkbox 
                                            id="select-all" 
                                            checked={selectedOrderIds.length === providerOrders?.data?.length && providerOrders?.data?.length > 0} 
                                            onCheckedChange={toggleAll}
                                        />
                                        <Label htmlFor="select-all" className="text-sm cursor-pointer">Chọn tất cả ({providerOrders?.data?.length})</Label>
                                    </div>
                                </div>
                                <div className="border rounded-xl overflow-hidden bg-white shadow-sm">
                                    <Table>
                                        <TableHeader className="bg-muted/50">
                                            <TableRow>
                                                <TableHead className="w-12"></TableHead>
                                                <TableHead>Tên dịch vụ / Mã đơn</TableHead>
                                                <TableHead>Ngày đặt</TableHead>
                                                <TableHead className="text-right">Tổng thanh toán</TableHead>
                                                <TableHead className="text-right">Nhận về (85%)</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {providerOrders?.data?.map((o: any) => {
                                                const isSelected = selectedOrderIds.includes(o.id_order);
                                                return (
                                                    <TableRow 
                                                        key={o.id_order} 
                                                        className={`transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''}`}
                                                        onClick={() => toggleOrder(o.id_order)}
                                                    >
                                                        <TableCell onClick={(e) => e.stopPropagation()}>
                                                            <Checkbox 
                                                                checked={isSelected}
                                                                onCheckedChange={() => toggleOrder(o.id_order)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="space-y-0.5">
                                                                <p className="font-bold text-sm">{o.service_name}</p>
                                                                <p className="font-mono text-[10px] text-muted-foreground">#{o.order_code}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-xs font-medium">{formatDate(o.create_at)}</TableCell>
                                                        <TableCell className="text-right text-xs">
                                                            {formatCurrency(o.total_amount)}
                                                        </TableCell>
                                                        <TableCell className="text-right font-bold text-primary">
                                                            {formatCurrency(o.owner_amount)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="proof" className="font-bold">Mã giao dịch / Ghi chú đối soát</Label>
                                    <Input
                                        id="proof"
                                        className="h-12 border-2 focus-visible:ring-primary"
                                        placeholder="VD: FT12345678 - Chuyển lương tháng 3 đợt 1..."
                                        value={transactionProof}
                                        onChange={(e) => setTransactionProof(e.target.value)}
                                    />
                                    <p className="text-[10px] text-orange-500 font-medium">* Lưu ý: Vui lòng kiểm tra kỹ số tài khoản và số tiền trước khi nhấn xác nhận.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="p-6 border-t bg-muted/10">
                        <Button variant="ghost" onClick={() => setIsDetailOpen(false)} className="h-12 px-8">Hủy bỏ</Button>
                        <Button
                            onClick={handleProcessPayroll}
                            disabled={payrollMutation.isPending || selectedOrderIds.length === 0}
                            className="bg-green-600 hover:bg-green-700 h-12 px-12 font-bold text-lg shadow-lg shadow-green-200"
                        >
                            {payrollMutation.isPending ? 'Đang thực hiện chuyển tiền...' : `XÁC NHẬN TRẢ LƯƠNG (${selectedOrderIds.length})`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default PayrollManagement;
