import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    ChevronLeft, CheckCircle2, Clock, Users, Phone,
    CreditCard, Receipt, Info, Calendar, Mail,
    MapPin, RefreshCw, XCircle
} from 'lucide-react';
import { ownerApi } from '@/api/owner.api';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';
import LoadingSkeleton from '@/components/LoadingSkeleton';
import ErrorState from '@/components/ErrorState';

export default function OwnerOrderDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchOrder = async () => {
        try {
            setLoading(true);
            const data = await ownerApi.getOrder(id!);
            setOrder(data);
            setError(null);
        } catch (err) {
            setError('Không tìm thấy đơn hàng');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchOrder();
    }, [id]);

    const handleUpdateStatus = async (status: string) => {
        try {
            await ownerApi.updateOrderStatus(id!, status as any);
            toast.success('Cập nhật trạng thái thành công');
            fetchOrder();
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    if (loading) return <LoadingSkeleton />;
    if (error || !order) return <ErrorState message={error || "Không tìm thấy dữ liệu"} />;

    const statusLabels: Record<string, string> = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        processing: 'Đang xử lý',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
    };

    const statusStyles: Record<string, string> = {
        pending: 'bg-amber-100 text-amber-700 border-amber-200',
        confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
        processing: 'bg-indigo-100 text-indigo-700 border-indigo-200',
        completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
        cancelled: 'bg-red-100 text-red-700 border-red-200',
    };

    return (
        <div className="page-enter max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <Button
                        variant="ghost"
                        onClick={() => navigate('/owner/orders')}
                        className="p-0 hover:bg-transparent text-slate-500 font-bold mb-2"
                    >
                        <ChevronLeft size={20} className="mr-1" /> Quay lại danh sách
                    </Button>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900">Chi tiết đơn hàng</h1>
                        <Badge className={`px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest border ${statusStyles[order.status] || ''}`}>
                            {statusLabels[order.status] || order.status}
                        </Badge>
                    </div>
                    <p className="text-slate-400 font-bold mt-1">Mã đơn: <span className="text-blue-600">#{order.order_code}</span> • Ngày đặt: {new Date(order.create_at).toLocaleString('vi-VN')}</p>
                </div>

                <div className="flex items-center gap-2">
                    {order.status === 'pending' && (
                        <>
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl px-6 h-12 shadow-lg shadow-emerald-100"
                                onClick={() => handleUpdateStatus('confirmed')}
                            >
                                <CheckCircle2 size={18} className="mr-2" /> Xác nhận đơn
                            </Button>
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 font-black rounded-2xl px-6 h-12"
                                onClick={() => handleUpdateStatus('cancelled')}
                            >
                                <XCircle size={18} className="mr-2" /> Từ chối
                            </Button>
                        </>
                    )}
                    {order.status === 'confirmed' && (
                        <Button
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl px-6 h-12 shadow-lg shadow-indigo-100"
                            onClick={() => handleUpdateStatus('processing')}
                        >
                            <RefreshCw size={18} className="mr-2" /> Bắt đầu xử lý
                        </Button>
                    )}
                    {['confirmed', 'processing'].includes(order.status) && (
                        <div className="flex gap-2">
                            <Button
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl px-6 h-12 shadow-lg shadow-emerald-100"
                                onClick={() => handleUpdateStatus('completed')}
                            >
                                <CheckCircle2 size={18} className="mr-2" /> Hoàn thành
                            </Button>
                            {order.order_type === 'accommodation' && order.status !== 'cancelled' && (
                                <Button
                                    variant="outline"
                                    className="border-blue-200 text-blue-600 hover:bg-blue-50 font-black rounded-2xl px-6 h-12"
                                    onClick={async () => {
                                        if (confirm('Bạn có chắc chắn muốn phát trả phòng sớm? Việc này sẽ giải phóng phòng cho khách khác đặt ngay từ hôm nay, trong khi trạng thái đơn hàng vẫn được giữ nguyên.')) {
                                            try {
                                                await ownerApi.releaseRoom(id!);
                                                toast.success('Đã giải phóng phòng thành công');
                                                fetchOrder();
                                            } catch (err: any) {
                                                toast.error(err.message || 'Lỗi khi giải phóng phòng');
                                            }
                                        }
                                    }}
                                >
                                    <RefreshCw size={18} className="mr-2" /> Trả phòng sớm
                                </Button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column: Details */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Customer Info */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Users size={16} /> Thông tin khách hàng
                            </h3>
                        </div>
                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Họ và tên</p>
                                    <p className="font-black text-lg text-slate-900">{order.customer_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                    <Phone size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Số điện thoại</p>
                                    <p className="font-black text-lg text-slate-900">{order.customer_phone}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
                                    <Mail size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email</p>
                                    <p className="font-black text-lg text-slate-900">{order.customer_email || 'N/A'}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service Info */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                        <div className="bg-slate-50/50 px-8 py-6 border-b border-slate-100">
                            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                <Receipt size={16} /> Chi tiết dịch vụ
                            </h3>
                        </div>
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6 pb-8 border-b border-slate-50">
                                <div>
                                    <Badge className="mb-3 bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1">
                                        {order.order_type}
                                    </Badge>
                                    <h2 className="text-2xl font-black text-slate-900 leading-tight">{order.details?.title}</h2>
                                    <div className="flex items-center gap-2 text-slate-400 font-bold mt-2">
                                        <MapPin size={14} /> <span>{order.details?.address || 'N/A'}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tổng cộng (Đã thu)</p>
                                    <p className="text-3xl font-black text-blue-600 tracking-tighter">{formatCurrency(order.total_amount)}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
                                <div className="space-y-6">
                                    {order.order_type === 'accommodation' && (
                                        <>
                                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                                                    <Calendar size={12} /> Thời gian lưu trú
                                                </p>
                                                <p className="font-black text-slate-900">
                                                    {new Date(order.details.start_date).toLocaleDateString('vi-VN')} - {new Date(order.details.end_date).toLocaleDateString('vi-VN')}
                                                </p>
                                            </div>
                                            <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                                                    <Info size={12} /> Hạng phòng
                                                </p>
                                                <p className="font-black text-slate-900">{order.details.name_room}</p>
                                            </div>
                                        </>
                                    )}

                                    {order.order_type === 'tour' && (
                                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                                                <Calendar size={12} /> Ngày tham gia
                                            </p>
                                            <p className="font-black text-slate-900">
                                                {new Date(order.details.booking_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}

                                    {order.order_type === 'vehicle' && (
                                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                                                    <Calendar size={12} /> Thông tin ghế ngồi
                                                </p>
                                                <p className="font-black text-slate-900">Ghế: {Array.isArray(order.details.seats) ? order.details.seats.join(', ') : order.details.code_position}</p>
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase mb-1">Phương tiện</p>
                                                <p className="font-black text-slate-900">{order.details.code_vehicle}</p>
                                            </div>
                                        </div>
                                    )}

                                    {order.order_type === 'ticket' && (
                                        <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                            <p className="text-[10px] font-black text-slate-400 uppercase mb-2 flex items-center gap-2">
                                                <Calendar size={12} /> Ngày sử dụng
                                            </p>
                                            <p className="font-black text-slate-900">
                                                {new Date(order.details.visit_date).toLocaleDateString('vi-VN')}
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    <div className="p-5 rounded-3xl bg-blue-50 flex items-center justify-between border border-blue-100">
                                        <div>
                                            <p className="text-[10px] font-black text-blue-400 uppercase mb-1 tracking-widest">Số lượng</p>
                                            <p className="text-2xl font-black text-blue-900">{order.details.quantity || 1} {order.order_type === 'accommodation' ? 'phòng' : (order.order_type === 'vehicle' ? 'Ghế' : 'khách')}</p>
                                        </div>
                                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-blue-500">
                                            <Users size={24} />
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-slate-50 border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-2">
                                            <CreditCard size={12} /> Phương thức thanh toán
                                        </p>
                                        <p className="font-black text-slate-900 uppercase">{order.payment_method}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: Summaries & Actions */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Payment Status */}
                    <Card className="rounded-[2.5rem] border-none shadow-xl shadow-slate-200/50 overflow-hidden bg-white">
                        <div className="bg-slate-50/50 px-8 py-5 border-b border-slate-100">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Trạng thái thanh toán</h4>
                        </div>
                        <CardContent className="p-8 text-center space-y-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-slate-900 mb-1 tracking-tight">Đã quyết toán</h4>
                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Giao dịch an toàn & minh bạch</p>
                            </div>
                            <div className="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-black text-emerald-600 uppercase">Doanh thu thu về</span>
                                    <span className="font-black text-emerald-700 text-lg">{formatCurrency(order.total_amount)}</span>
                                </div>
                                <p className="text-[9px] font-bold text-emerald-500/70 italic text-right">* Sau khi trừ phí nền tảng (nếu có)</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Support Info */}
                    <Card className="rounded-[3rem] border-none shadow-2xl shadow-blue-500/10 bg-gradient-to-br from-slate-900 to-indigo-950 text-white overflow-hidden relative group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-500/40 transition-all duration-700"></div>
                        <CardContent className="p-8 relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-blue-400">
                                    <Phone size={20} />
                                </div>
                                <h4 className="font-black text-xs uppercase tracking-widest text-blue-400">Hỗ trợ đối tác</h4>
                            </div>
                            <p className="text-sm font-medium text-slate-300 leading-relaxed">Gặp sự cố với đơn hàng này? Liên hệ bộ phận quản lý đại lý ngay.</p>
                            <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-black rounded-2xl h-12 shadow-xl shadow-black/20">Liên hệ Support</Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
