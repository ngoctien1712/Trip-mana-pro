import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin.api';
import { PageHeader } from '@/components/PageHeader';
import { StatCard, StatsGrid } from '@/components/StatsCards';
import { StatsGridSkeleton } from '@/components/LoadingSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShoppingBag, DollarSign, Users, Map, Calculator } from 'lucide-react';
import { formatCurrency, formatDate } from '@/utils/format';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => adminApi.getDashboardStats(),
    refetchInterval: 15000, // Refresh every 15 seconds
  });

  return (
    <div className="page-enter">
      <PageHeader
        title="Tổng quan"
        description="Xem tổng quan hoạt động của hệ thống"
      />

      {isLoading ? (
        <StatsGridSkeleton />
      ) : stats ? (
        <>
          <StatsGrid className="mb-6">
            <StatCard
              title="Tổng người dùng"
              value={stats.summary.totalUsers}
              icon={<Users className="h-6 w-6" />}
            />
            <StatCard
              title="Đơn hành thành công"
              value={stats.summary.totalOrders}
              icon={<ShoppingBag className="h-6 w-6" />}
            />
            <StatCard
              title="Tổng doanh thu"
              value={formatCurrency(stats.summary.totalRevenue)}
              icon={<DollarSign className="h-6 w-6" />}
              changeLabel="Toàn bộ hệ thống"
            />
            <StatCard
              title="Hoa hồng Admin (15%)"
              value={formatCurrency(stats.summary.totalCommission)}
              icon={<Calculator className="h-6 w-6 text-green-500" />}
              className="border-green-200 bg-green-50/30"
            />
          </StatsGrid>

          <Card className="mb-6 card-elevated">
            <CardHeader>
              <CardTitle>Biểu đồ doanh thu (30 ngày gần đây)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tick={{fontSize: 12}} 
                      tickFormatter={(value) => {
                        const d = new Date(value);
                        return `${d.getDate()}/${d.getMonth() + 1}`;
                      }}
                    />
                    <YAxis tick={{fontSize: 12}} tickFormatter={(value) => formatCurrency(value).replace('₫', '')} />
                    <Tooltip 
                      formatter={(value: any) => [formatCurrency(value), '']}
                      labelFormatter={(label) => formatDate(label)}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      name="Doanh thu"
                      stroke="#3b82f6" 
                      fillOpacity={1} 
                      fill="url(#colorRevenue)" 
                      strokeWidth={3}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="commission" 
                      name="Hoa hồng (15%)"
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorCommission)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 card-elevated">
              <CardHeader>
                <CardTitle>Đơn hàng mới nhất</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Mã đơn</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Tổng tiền</TableHead>
                      <TableHead className="text-right">Ngày</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stats.recentBookings?.map((order: any) => (
                      <TableRow key={order.id_order}>
                        <TableCell className="font-mono text-xs">{order.order_code}</TableCell>
                        <TableCell>{order.user_name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            order.status === 'completed' ? 'default' :
                            order.status === 'confirmed' || order.status === 'processing' ? 'secondary' : 'outline'
                          }>
                            {order.status === 'pending' ? 'Chờ thanh toán' :
                             order.status === 'confirmed' ? 'Đã thanh toán' :
                             order.status === 'processing' ? 'Đang thực hiện' :
                             order.status === 'completed' ? 'Hoàn thành' : 'Đã hủy'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(order.total_amount)}</TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">{formatDate(order.create_at)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="card-elevated">
              <CardHeader>
                <CardTitle>Cơ cấu doanh thu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex justify-between items-center p-4 bg-primary/5 rounded-lg border-l-4 border-primary">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Admin Profit (15%)</p>
                      <p className="text-2xl font-bold text-primary">{formatCurrency(stats.summary.totalCommission)}</p>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-muted-foreground">Provider Share (85%)</p>
                      <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.summary.totalOwnerShare)}</p>
                    </div>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50 text-xs text-muted-foreground italic">
                    * Thống kê này được tính toán dựa trên thực tế các giao dịch đã xác nhận thanh toán.
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      ) : null}
    </div>
  );
};

export default AdminDashboard;