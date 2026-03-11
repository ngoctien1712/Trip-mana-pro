import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { voucherApi, type Voucher } from '@/api/voucher.api';
import { ownerGeographyApi } from '@/api/owner-geography.api';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    ArrowLeft,
    Save,
    Trash2,
    Loader2,
    Ticket,
    Info
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

export const VoucherDetail = () => {
    const { idVoucher } = useParams<{ idVoucher: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [formData, setFormData] = useState<Partial<Voucher>>({
        code: '',
        name: '',
        description: '',
        voucherType: 'price',
        idProvider: '',
        idItem: null,
        discountType: 'percentage',
        discountValue: 0,
        minOrderValue: 0,
        minQuantity: 0,
        maxDiscountAmount: 0,
        quantity: 0,
        from: '',
        to: '',
        status: 'active'
    });

    const { data: voucherData, isLoading: isLoadingVoucher } = useQuery({
        queryKey: ['voucher-detail', idVoucher],
        queryFn: () => voucherApi.getVoucherDetail(idVoucher!),
        enabled: !!idVoucher,
    });

    useEffect(() => {
        if (voucherData?.data) {
            const v = voucherData.data;
            setFormData({
                code: v.code,
                name: v.name,
                description: v.description,
                voucherType: v.voucherType || 'price',
                idProvider: v.idProvider,
                idItem: v.idItem,
                discountType: v.discountType,
                discountValue: v.discountValue,
                minOrderValue: v.minOrderValue,
                minQuantity: v.minQuantity,
                maxDiscountAmount: v.maxDiscountAmount,
                quantity: v.quantity,
                from: (v.from && !isNaN(new Date(v.from).getTime())) ? format(new Date(v.from), 'yyyy-MM-dd') : '',
                to: (v.to && !isNaN(new Date(v.to).getTime())) ? format(new Date(v.to), 'yyyy-MM-dd') : '',
                status: v.status
            });
        }
    }, [voucherData]);

    const { data: providersData } = useQuery({
        queryKey: ['owner', 'providers'],
        queryFn: () => ownerGeographyApi.getMyProviders(),
    });
    const providers = providersData?.data ?? [];

    const { data: servicesData } = useQuery({
        queryKey: ['owner', 'provider-services', formData.idProvider],
        queryFn: () => ownerGeographyApi.listMyBookableItems(formData.idProvider!),
        enabled: !!formData.idProvider,
    });
    const services = servicesData?.data ?? [];

    const updateMut = useMutation({
        mutationFn: (data: Partial<Voucher>) => voucherApi.updateVoucher(idVoucher!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['voucher-detail', idVoucher] });
            toast.success('Đã cập nhật voucher thành công');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật voucher');
        }
    });

    const deleteMut = useMutation({
        mutationFn: () => voucherApi.deleteVoucher(idVoucher!),
        onSuccess: () => {
            toast.success('Đã xóa voucher');
            navigate(-1);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Không thể xóa voucher này');
        }
    });

    const handleSubmit = () => {
        if (!formData.code || !formData.name || !formData.idProvider || !formData.discountValue) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        const payload = {
            ...formData,
            from: formData.from ? `${formData.from}T00:00:00` : null,
            to: formData.to ? `${formData.to}T23:59:59` : null
        };

        updateMut.mutate(payload);
    };

    if (isLoadingVoucher) {
        return <div className="p-10 text-center"><Loader2 className="h-10 w-10 animate-spin mx-auto mb-4" /> Đang tải dữ liệu voucher...</div>;
    }

    return (
        <div className="space-y-6 pb-20 page-enter">
            <div className="flex items-center gap-4 mb-2">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                    <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Chi tiết Voucher</h1>
                    <p className="text-muted-foreground">Chỉnh sửa thông tin mã giảm giá</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin cơ bản</CardTitle>
                            <CardDescription>Các thông tin định danh của voucher</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code" className="text-red-500 font-bold">Mã Voucher *</Label>
                                    <Input
                                        id="code"
                                        placeholder="VD: GIAM20, SUMMER2024"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-red-500 font-bold">Tên hiển thị *</Label>
                                    <Input
                                        id="name"
                                        placeholder="VD: Giảm giá hè 20%"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Mô tả chi tiết</Label>
                                <Textarea
                                    id="description"
                                    placeholder="Nội dung khuyến mãi, điều kiện áp dụng..."
                                    rows={4}
                                    value={formData.description || ''}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-red-500 font-bold">Nhà cung cấp *</Label>
                                    <Select
                                        value={formData.idProvider}
                                        onValueChange={(val) => setFormData({ ...formData, idProvider: val, idItem: null })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {providers.map((p: any) => (
                                                <SelectItem key={p.id_provider} value={p.id_provider}>{p.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Áp dụng cho dịch vụ (Tùy chọn)</Label>
                                    <Select
                                        value={formData.idItem || 'all'}
                                        onValueChange={(val) => setFormData({ ...formData, idItem: val === 'all' ? null : val })}
                                        disabled={!formData.idProvider}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Tất cả dịch vụ" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả dịch vụ</SelectItem>
                                            {services.map((s: any) => (
                                                <SelectItem key={s.id_item} value={s.id_item}>{s.title}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Cấu hình giảm giá</CardTitle>
                            <CardDescription>Thiết lập giá trị và loại hình giảm giá</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label>Loại giảm giá</Label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.discountType === 'percentage' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted'}`}>
                                            <Input type="radio" className="hidden" checked={formData.discountType === 'percentage'} onChange={() => setFormData({ ...formData, discountType: 'percentage' })} />
                                            <span className={`text-sm font-bold ${formData.discountType === 'percentage' ? 'text-primary' : 'text-muted-foreground'}`}>Theo %</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${formData.discountType === 'fixed_amount' ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'hover:bg-muted'}`}>
                                            <Input type="radio" className="hidden" checked={formData.discountType === 'fixed_amount'} onChange={() => setFormData({ ...formData, discountType: 'fixed_amount' })} />
                                            <span className={`text-sm font-bold ${formData.discountType === 'fixed_amount' ? 'text-primary' : 'text-muted-foreground'}`}>Số tiền cố định</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-red-500 font-bold">Giá trị giảm *</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                                            {formData.discountType === 'percentage' ? '%' : '₫'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Đơn hàng tối thiểu (₫)</Label>
                                    <Input
                                        type="number"
                                        value={formData.minOrderValue}
                                        onChange={(e) => setFormData({ ...formData, minOrderValue: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Số lượng tối thiểu</Label>
                                    <Input
                                        type="number"
                                        value={formData.minQuantity}
                                        onChange={(e) => setFormData({ ...formData, minQuantity: Number(e.target.value) })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Giảm tối đa (₫)</Label>
                                    <Input
                                        type="number"
                                        value={formData.maxDiscountAmount}
                                        onChange={(e) => setFormData({ ...formData, maxDiscountAmount: Number(e.target.value) })}
                                        disabled={formData.discountType === 'fixed_amount'}
                                        placeholder={formData.discountType === 'fixed_amount' ? 'Không áp dụng' : '0'}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Thời hạn & Số lượng</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Tổng số lượng mã</Label>
                                <Input
                                    type="number"
                                    value={formData.quantity}
                                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                />
                                <p className="text-[10px] text-muted-foreground">0 = Không giới hạn số lượng</p>
                            </div>

                            <div className="space-y-2">
                                <Label>Từ ngày</Label>
                                <Input
                                    type="date"
                                    value={formData.from}
                                    onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Đến ngày</Label>
                                <Input
                                    type="date"
                                    value={formData.to}
                                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Trạng thái</Label>
                                <Select
                                    value={formData.status}
                                    onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Đang hoạt động</SelectItem>
                                        <SelectItem value="inactive">Tạm ngưng</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-red-200 bg-red-50/10">
                        <CardHeader>
                            <CardTitle className="text-red-600 text-sm">Thao tác</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button className="w-full gradient-sunset border-none" onClick={handleSubmit} disabled={updateMut.isPending}>
                                {updateMut.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Lưu thay đổi
                            </Button>

                            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 border-red-200" onClick={() => { if (confirm('Xác nhận xóa voucher này?')) { deleteMut.mutate(); } }} disabled={deleteMut.isPending}>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa Voucher
                            </Button>
                        </CardContent>
                    </Card>

                    <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 flex gap-3">
                        <Info className="h-5 w-5 text-blue-500 shrink-0" />
                        <div className="text-xs text-blue-700 leading-relaxed">
                            <p className="font-bold mb-1">Lưu ý cho Quản trị viên:</p>
                            Mọi thay đổi sẽ có hiệu lực ngay lập tức. Admin có quyền chỉnh sửa toàn bộ thông tin của voucher thuộc bất kỳ nhà cung cấp nào.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
