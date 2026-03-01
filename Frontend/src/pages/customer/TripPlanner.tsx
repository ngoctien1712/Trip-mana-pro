import { useState, useEffect } from 'react';
import {
  Plus,
  MapPin,
  Calendar,
  Wallet,
  Compass,
  Clock,
  Star,
  ArrowRight,
  ChevronRight,
  Plane,
  Hotel,
  Coffee,
  Camera,
  Heart,
  Share2,
  Trash2,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { customerApi } from '@/api/customer.api';
import { toast } from 'sonner';

export default function TripPlanner() {
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    budget: '',
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [savedPlans, setSavedPlans] = useState<any[]>([]);
  const [tripStyle, setTripStyle] = useState('relax');

  const popularDestinations = [
    { name: 'Đà Lạt', image: 'https://images.unsplash.com/photo-1594495894542-a42cb4cb5bf3?q=80&w=200' },
    { name: 'Phú Quốc', image: 'https://images.unsplash.com/photo-1589313647918-05bf86dd0f41?q=80&w=200' },
    { name: 'Hà Giang', image: 'https://images.unsplash.com/photo-15090101442bb3-119747941ce3?q=80&w=200' },
    { name: 'Hội An', image: 'https://images.unsplash.com/photo-1555921015-5532091f6026?q=80&w=200' },
  ];

  const tripStyles = [
    { id: 'relax', name: 'Nghỉ dưỡng', icon: <Coffee className="w-4 h-4" /> },
    { id: 'adventure', name: 'Khám phá', icon: <Compass className="w-4 h-4" /> },
    { id: 'culture', name: 'Văn hóa', icon: <Camera className="w-4 h-4" /> },
    { id: 'luxury', name: 'Sang trọng', icon: <Star className="w-4 h-4" /> },
  ];

  useEffect(() => {
    fetchSavedPlans();
  }, []);

  const fetchSavedPlans = async () => {
    try {
      const plans = await customerApi.listTripPlans();
      setSavedPlans(plans || []);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách kế hoạch:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.destination || !formData.startDate || !formData.endDate) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const plan = await customerApi.createTripPlan({
        destination: formData.destination,
        startDate: formData.startDate,
        endDate: formData.endDate,
        budget: formData.budget ? Number(formData.budget) : undefined,
        style: tripStyle,
      });
      setGeneratedPlan(plan);
      toast.success('Đã tạo kế hoạch chuyến đi thành công!');
      fetchSavedPlans();
    } catch (error) {
      toast.error('Lỗi khi tạo kế hoạch chuyến đi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Bạn có chắc chắn muốn xóa kế hoạch này?')) return;

    try {
      await customerApi.deleteTripPlan(id);
      toast.success('Đã xóa kế hoạch thành công');
      fetchSavedPlans();
    } catch (error) {
      toast.error('Lỗi khi xóa kế hoạch');
    }
  };

  const getPlanDuration = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} ngày ${diffDays - 1} đêm`;
  };

  const getActivityIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('ăn')) return <Coffee className="w-4 h-4 text-orange-500" />;
    if (t.includes('tham quan') || t.includes('khám phá')) return <Camera className="w-4 h-4 text-green-500" />;
    if (t.includes('nghỉ') || t.includes('hotel')) return <Hotel className="w-4 h-4 text-blue-500" />;
    if (t.includes('di chuyển') || t.includes('bay')) return <Plane className="w-4 h-4 text-purple-500" />;
    return <Compass className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-20 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-3xl -mr-64 -mt-64 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/40 rounded-full blur-3xl -ml-64 -mb-64 animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Hero Section */}
      <div className="relative h-[350px] overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop"
          alt="Travel Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-16">
          <div className="max-w-4xl mx-auto w-full">
            <Badge className="mb-4 bg-blue-500/20 text-blue-300 border-blue-500/30 backdrop-blur-md">
              Công cụ thông minh
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Lập kế hoạch <span className="text-blue-400">Chuyến đi</span>
            </h1>
            <p className="text-gray-300 text-lg md:text-xl max-w-2xl leading-relaxed">
              Tạo hành trình mơ ước của bạn trong vài giây. Chúng tôi sẽ gợi ý những điểm đến và dịch vụ tốt nhất dựa trên sở thích của bạn.
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto -mt-12 relative z-10 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/80 backdrop-blur-md shadow-lg border border-slate-200">
              <TabsTrigger value="new" className="px-8 flex gap-2">
                <Plus className="w-4 h-4" />
                Kế hoạch mới
              </TabsTrigger>
              <TabsTrigger value="saved" className="px-8 flex gap-2">
                <Heart className="w-4 h-4" />
                Đã lưu ({savedPlans.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="new" className="mt-0">
            <div className="space-y-8">
              {/* Vibrant Input Area */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[32px] blur opacity-20 group-hover:opacity-30 transition duration-1000 group-hover:duration-200"></div>
                <Card className="relative border-none shadow-2xl bg-white/95 backdrop-blur-md rounded-[32px] overflow-hidden">
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    {/* Left: Interactive Form */}
                    <div className="lg:col-span-8 p-8 md:p-10 border-r border-slate-100">
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-200">
                          <Compass className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">Chi tiết hành trình</h3>
                          <p className="text-sm text-slate-500">Bắt đầu thiết kế chuyến đi dành riêng cho bạn</p>
                        </div>
                      </div>

                      <form onSubmit={handleGeneratePlan} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <MapPin className="w-4 h-4 text-blue-500" />
                              Điểm đến mơ ước
                            </label>
                            <div className="relative">
                              <Input
                                name="destination"
                                value={formData.destination}
                                onChange={handleInputChange}
                                placeholder="Bạn muốn đi đâu?"
                                className="h-14 pl-12 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl transition-all"
                                required
                              />
                              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            </div>

                            <div className="flex flex-wrap gap-2 pt-2">
                              {popularDestinations.map((dest) => (
                                <button
                                  key={dest.name}
                                  type="button"
                                  onClick={() => setFormData(prev => ({ ...prev, destination: dest.name }))}
                                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors border border-transparent hover:border-blue-200"
                                >
                                  {dest.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-orange-500" />
                              Thời gian chuyến đi
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="relative">
                                <Input
                                  name="startDate"
                                  type="date"
                                  value={formData.startDate}
                                  onChange={handleInputChange}
                                  className="h-14 pl-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl"
                                  required
                                />
                              </div>
                              <div className="relative">
                                <Input
                                  name="endDate"
                                  type="date"
                                  value={formData.endDate}
                                  onChange={handleInputChange}
                                  className="h-14 pl-4 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl"
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
                          <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Compass className="w-4 h-4 text-emerald-500" />
                              Phong cách chuyến đi
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                              {tripStyles.map((style) => (
                                <button
                                  key={style.id}
                                  type="button"
                                  onClick={() => setTripStyle(style.id)}
                                  className={`flex items-center gap-2 px-4 h-12 rounded-2xl text-sm font-medium transition-all ${tripStyle === style.id
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                    : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                  {style.icon}
                                  {style.name}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-4">
                            <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-purple-500" />
                              Ngân sách dự kiến
                            </label>
                            <div className="relative">
                              <Input
                                name="budget"
                                type="number"
                                value={formData.budget}
                                onChange={handleInputChange}
                                placeholder="Ví dụ: 5.000.000"
                                className="h-14 pl-12 bg-slate-50 border-none focus:ring-2 focus:ring-blue-500/20 rounded-2xl"
                              />
                              <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">VND</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 rounded-2xl bg-slate-900 hover:bg-black text-white text-lg font-bold shadow-2xl transition-all duration-300 group"
                          >
                            {loading ? (
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Đang thiết kế lịch trình...</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-3">
                                <span>Khám phá ngay</span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                              </div>
                            )}
                          </Button>
                        </div>
                      </form>
                    </div>

                    {/* Right: Inspirational Sidebar */}
                    <div className="lg:col-span-4 bg-slate-50/50 p-8 flex flex-col justify-center border-l border-slate-100">
                      <div className="space-y-6">
                        <div className="text-center space-y-2">
                          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <Star className="w-8 h-8 text-yellow-400 fill-yellow-400" />
                          </div>
                          <h4 className="font-bold text-slate-900">Cảm hứng du lịch</h4>
                          <p className="text-sm text-slate-500">Khám phá các điểm đến được yêu thích nhất tháng này</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          {popularDestinations.map((dest) => (
                            <div
                              key={dest.name}
                              className="group/item relative h-28 rounded-2xl overflow-hidden cursor-pointer shadow-sm"
                              onClick={() => setFormData(prev => ({ ...prev, destination: dest.name }))}
                            >
                              <img src={dest.image} alt={dest.name} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/30 group-hover/item:bg-black/10 transition-colors"></div>
                              <span className="absolute bottom-2 left-2 right-2 text-center text-xs font-bold text-white drop-shadow-md">
                                {dest.name}
                              </span>
                            </div>
                          ))}
                        </div>

                        <div className="bg-blue-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-blue-200">
                          <p className="text-xs font-medium opacity-80 mb-1">Mẹo nhỏ</p>
                          <p className="text-sm font-bold">Hãy chọn phong cách "Khám phá" để nhận được nhiều địa điểm ẩn dấu!</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Display Area */}
              <div className="w-full">
                {!generatedPlan ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
                    {[
                      { icon: <Clock className="text-blue-500" />, title: 'Tiết kiệm thời gian', desc: 'Có ngay lịch trình chuyên nghiệp chỉ trong vài giây.' },
                      { icon: <MapPin className="text-orange-500" />, title: 'Điểm đến độc quyền', desc: 'Gợi ý các địa điểm bản địa mà bạn khó tìm thấy trên mạng.' },
                      { icon: <Heart className="text-red-500" />, title: 'Đúng sở thích', desc: 'Sắp xếp hoạt động dựa trên phong cách du lịch của bạn.' }
                    ].map((feature, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
                          {feature.icon}
                        </div>
                        <h4 className="font-bold text-slate-900 mb-2">{feature.title}</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
                    <Card className="border-none shadow-xl bg-white overflow-hidden">
                      <div className="relative h-40 bg-blue-600">
                        <img
                          src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop`}
                          alt="Paris"
                          className="w-full h-full object-cover opacity-50"
                        />
                        <div className="absolute inset-0 flex flex-col justify-center px-10">
                          <h2 className="text-4xl font-bold text-white mb-2">{generatedPlan.destination}</h2>
                          <div className="flex items-center gap-4 text-blue-100">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(generatedPlan.startDate).toLocaleDateString('vi-VN')} - {new Date(generatedPlan.endDate).toLocaleDateString('vi-VN')}
                            </span>
                            <span className="w-1.5 h-1.5 bg-blue-300 rounded-full"></span>
                            <span>{getPlanDuration(generatedPlan.startDate, generatedPlan.endDate)}</span>
                          </div>
                        </div>
                        <div className="absolute top-6 right-6 flex gap-2">
                          <Button size="icon" variant="secondary" className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40">
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="secondary" className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/40">
                            <Heart className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>

                    <div className="space-y-6">
                      {generatedPlan.days.map((day: any) => (
                        <div key={day.dayNumber} className="relative pl-10">
                          <div className="absolute left-[19px] top-8 bottom-0 w-0.5 bg-slate-200"></div>
                          <div className="absolute left-0 top-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold shadow-lg shadow-blue-200 z-10">
                            {day.dayNumber}
                          </div>

                          <div className="space-y-4 pt-1">
                            <h3 className="text-xl font-bold text-slate-800 ml-2">Hành trình Ngày {day.dayNumber}</h3>
                            <div className="grid gap-4">
                              {day.activities.map((activity: any, idx: number) => (
                                <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow group overflow-hidden bg-white">
                                  <div className="flex">
                                    <div className="w-1 bg-slate-100 group-hover:bg-blue-500 transition-colors"></div>
                                    <div className="p-4 flex flex-1 gap-4">
                                      <div className="w-16 flex flex-col items-center">
                                        <div className="text-sm font-bold text-blue-600">{activity.time}</div>
                                        <div className="mt-2 text-slate-300">
                                          {getActivityIcon(activity.title)}
                                        </div>
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex justify-between items-start mb-1">
                                          <h4 className="font-bold text-slate-800">{activity.title}</h4>
                                          {idx === 0 && <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none text-[10px]">Đề xuất</Badge>}
                                        </div>
                                        <p className="text-slate-500 text-sm leading-relaxed">{activity.description}</p>
                                        <div className="mt-3 flex items-center gap-4 text-[11px] text-slate-400">
                                          <span className="flex items-center gap-1"><Info className="w-3 h-3" /> Chi tiết</span>
                                          <span className="flex items-center gap-1 hover:text-blue-500 cursor-pointer"><Star className="w-3 h-3" /> Lưu địa điểm</span>
                                        </div>
                                      </div>
                                      <Button variant="ghost" size="icon" className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  </div>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-center pt-8">
                      <Button className="rounded-full px-12 h-14 bg-slate-900 hover:bg-black text-white shadow-2xl">
                        Lưu toàn bộ lịch trình
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="saved">
            {savedPlans.length === 0 ? (
              <div className="bg-white rounded-3xl p-16 flex flex-col items-center text-center shadow-sm">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-10 h-10 text-slate-200" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">Cần chút cảm hứng?</h3>
                <p className="text-slate-500 max-w-sm mt-2 mb-6">
                  Bạn chưa có kế hoạch nào được lưu. Hãy thử tạo một hành trình mới cho kỳ nghỉ tiếp theo nhé!
                </p>
                <Button onClick={() => setActiveTab('new')} variant="outline" className="rounded-full">
                  Bắt đầu ngay
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedPlans.map((plan: any) => (
                  <Card key={plan.id_trip_plan} className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={`https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1000&auto=format&fit=crop`}
                        alt={plan.destination}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-4 left-4">
                        <h4 className="text-xl font-bold text-white">{plan.destination}</h4>
                        <p className="text-gray-200 text-xs flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(plan.startDate).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 text-white">
                        {plan.days?.length || 0} ngày
                      </Badge>
                    </div>
                    <CardContent className="p-5">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex -space-x-2">
                          {[1, 2, 3].map(i => (
                            <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold overflow-hidden">
                              <img src={`https://i.pravatar.cc/100?u=${i}`} alt="user" />
                            </div>
                          ))}
                        </div>
                        <span className="text-xs text-slate-400 font-medium">3 người tham gia</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => {
                            setGeneratedPlan(plan);
                            setActiveTab('new');
                          }}
                          className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border-none shadow-none"
                        >
                          Xem chi tiết
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 border-red-500/20 hover:bg-red-50"
                          onClick={(e) => handleDeletePlan(plan.id_trip_plan, e)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
