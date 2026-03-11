import { useQuery } from '@tanstack/react-query';
import { ownerApi } from '@/api/owner.api';
import { PageHeader } from '@/components/PageHeader';
import { StatCard, StatsGrid } from '@/components/StatsCards';
import { StatsGridSkeleton } from '@/components/LoadingSkeleton';
import { ShoppingBag, DollarSign, Star, Map, TrendingUp, Calendar, ArrowRight, Wallet } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const OwnerDashboard = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['owner-dashboard'],
        queryFn: () => ownerApi.getDashboard(),
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) {
        return (
            <div className="space-y-8 p-6">
                <PageHeader title="Tổng quan" description="Đang tải dữ liệu kinh doanh của bạn..." />
                <StatsGridSkeleton />
            </div>
        );
    }

    return (
        <div className="page-enter space-y-8 p-6">
            <PageHeader
                title="Tổng quan kinh doanh"
                description="Theo dõi doanh thu và hoạt động các dịch vụ của bạn"
            />

            <StatsGrid>
                <StatCard
                    title="Doanh thu thực nhận"
                    value={formatCurrency(stats?.totalRevenue || 0)}
                    icon={<Wallet className="h-6 w-6 text-green-500" />}
                    change={stats?.revenueChange}
                    changeLabel="so với tháng trước"
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats?.totalOrders || 0}
                    icon={<ShoppingBag className="h-6 w-6 text-blue-500" />}
                    change={stats?.ordersChange}
                    changeLabel="so với tháng trước"
                />
                <StatCard
                    title="Dịch vụ hoạt động"
                    value={stats?.totalServices || 0}
                    icon={<Map className="h-6 w-6 text-orange-500" />}
                />
                <StatCard
                    title="Đánh giá khách hàng"
                    value={(stats?.averageRating || 0).toFixed(1)}
                    icon={<Star className="h-6 w-6 text-yellow-500" />}
                />
            </StatsGrid>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 30-Day Revenue Chart */}
                <Card className="lg:col-span-2 card-elevated">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Biểu đồ doanh thu 30 ngày
                                </CardTitle>
                                <CardDescription>Thống kê số tiền thực nhận (85% giá trị đơn hàng)</CardDescription>
                            </div>
                            <Badge variant="outline" className="h-fit">30 Ngày gần nhất</Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[350px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={stats?.chartData || []}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15}/>
                                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fontSize: 12, fill: '#888'}}
                                />
                                <YAxis 
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{fontSize: 12, fill: '#888'}}
                                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                                />
                                <Tooltip 
                                    contentStyle={{ 
                                        borderRadius: '12px', 
                                        border: 'none', 
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                    }}
                                    formatter={(value: any) => [formatCurrency(value), 'Thực nhận']}
                                />
                                <Area 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    stroke="#2563eb" 
                                    strokeWidth={3}
                                    fillOpacity={1} 
                                    fill="url(#colorRevenue)" 
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Performance Summary */}
                <Card className="card-elevated bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            Tổng kết kỳ quyết toán
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="p-4 rounded-2xl bg-white shadow-sm border space-y-2">
                            <p className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Doanh thu tháng này</p>
                            <p className="text-3xl font-black text-primary">{formatCurrency(stats?.totalRevenue || 0)}</p>
                            <div className="flex items-center gap-1 text-xs text-green-600 font-bold">
                                <TrendingUp className="h-3 w-3" />
                                +15.2% so với tháng 2
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-sm font-bold flex items-center justify-between">
                                Hiệu suất dịch vụ
                                <span className="text-[10px] text-muted-foreground uppercase font-black">Rating</span>
                            </h4>
                            <div className="space-y-3">
                                {[
                                    { name: 'Tour tham quan Sài Gòn', value: 85, color: 'bg-blue-500', rating: 4.9 },
                                    { name: 'Khách sạn Vũng Tàu', value: 65, color: 'bg-purple-500', rating: 4.7 },
                                    { name: 'Vé Xe chất lượng cao', value: 45, color: 'bg-orange-500', rating: 4.5 }
                                ].map((item, i) => (
                                    <div key={i} className="space-y-1.5">
                                        <div className="flex justify-between text-xs font-bold">
                                            <span>{item.name}</span>
                                            <span className="text-yellow-600 flex items-center gap-1">
                                                <Star className="h-3 w-3 fill-yellow-600" />
                                                {item.rating}
                                            </span>
                                        </div>
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <Button asChild className="w-full mt-4" variant="outline">
                            <Link to="/owner/orders">
                                Quản lý đơn hàng <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Orders Table */}
            <Card className="card-elevated">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                            <ShoppingBag className="h-5 w-5 text-blue-500" />
                            Đơn hàng mới nhận
                        </CardTitle>
                        <CardDescription>Danh sách 10 đơn đặt dịch vụ gần nhất của bạn</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Mã đơn</TableHead>
                                <TableHead>Ngày đặt</TableHead>
                                <TableHead>Nhà cung cấp</TableHead>
                                <TableHead>Trạng thái</TableHead>
                                <TableHead className="text-right">Tổng thanh toán</TableHead>
                                <TableHead className="text-right">Thực nhận (85%)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats?.recentOrders?.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground italic">
                                        Chưa có đơn hàng nào được ghi nhận.
                                    </TableCell>
                                </TableRow>
                            ) : stats?.recentOrders?.map((order: any) => (
                                <TableRow key={order.id_order} className="hover:bg-muted/30 transition-colors">
                                    <TableCell className="font-mono font-bold text-primary">#{order.order_code}</TableCell>
                                    <TableCell className="text-sm font-medium">{formatDate(order.create_at)}</TableCell>
                                    <TableCell className="text-sm">{order.provider_name}</TableCell>
                                    <TableCell>
                                        <Badge variant={
                                            order.status === 'completed' ? 'secondary' : 
                                            order.status === 'confirmed' ? 'outline' : 
                                            'default'
                                        } className="capitalize">
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right font-medium">{formatCurrency(order.total_amount)}</TableCell>
                                    <TableCell className="text-right font-black text-green-600 italic">
                                        {formatCurrency(order.owner_amount)}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default OwnerDashboard;