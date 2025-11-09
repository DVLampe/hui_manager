'use client';
import { useState, useEffect, useRef } from 'react';
import logger from '@/lib/logger.client';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { formatVietnameseCurrency } from '@/lib/utils';
import { HuiList } from '@/components/shared/hui/HuiList';
import StatCard from '@/components/ui/StatCard';
import { 
  TrendingUp, TrendingDown, Users, Clock, DollarSign, 
  PieChart, Download, ChevronDown, Calendar
} from 'lucide-react';

const DashboardChart = dynamic(() => import('@/components/dashboard/DashboardChart'), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center"><p>Loading chart...</p></div>
});

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupBy, setGroupBy] = useState('month');
  const [activeTab, setActiveTab] = useState('participating');
  const [isChartLoading, setIsChartLoading] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    logger.info("Dashboard page loaded");
    const fetchStats = async () => {
      const isChartUpdate = !isInitialMount.current;
      
      if (isChartUpdate) {
        setIsChartLoading(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/dashboard?groupBy=${groupBy}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        if (isChartUpdate) {
          setIsChartLoading(false);
        } else {
          setLoading(false);
          isInitialMount.current = false;
        }
      }
    };

    fetchStats();
  }, [groupBy]);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  const statCards = [
    { label: 'Tổng tiền đã trả', value: formatVietnameseCurrency(stats?.totalPaid) || '0', icon: DollarSign, color: 'red' },
    { label: 'Tổng tiền đã nhận', value: formatVietnameseCurrency(stats?.totalReceived) || '0', icon: TrendingUp, color: 'green' },
    { label: 'Tổng tiền thảo', value: formatVietnameseCurrency(stats?.totalThao) || '0', icon: PieChart, color: 'yellow' },
    { label: 'Lợi nhuận', value: formatVietnameseCurrency(stats?.profitLoss) || '0', icon: TrendingDown, color: 'orange' },
    { label: 'Tổng số hụi', value: stats?.totalHui || '0', icon: Users, color: 'blue' },
    { label: 'Số hụi đang tham gia', value: stats?.participatingHui || '0', icon: Clock, color: 'purple' },
    { label: 'Kỳ sắp tới', value: '3', icon: Calendar, color: 'pink' }, // Mock data, replace if available
    { label: 'Tổng thành viên', value: '42', icon: Users, color: 'indigo' } // Mock data, replace if available
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Bảng thống kê</h1>
        <p className="text-gray-500 mt-1">Tổng quan hoạt động tài chính của bạn</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, index) => (
          <StatCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
          />
        ))}
      </div>

      <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">Biểu đồ thống kê</h2>
          <div className="flex items-center gap-2">
            <select 
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="day">Ngày</option>
              <option value="month">Tháng</option>
              <option value="year">Năm</option>
            </select>
          </div>
        </div>
        
        <div className="relative h-80">
          <DashboardChart chartData={stats?.monthlyStats} isLoading={isChartLoading} />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Danh sách Hụi</h2>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={() => setActiveTab('participating')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'participating' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hụi tham gia
            </button>
            <button 
              onClick={() => setActiveTab('owned')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'owned' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Hụi làm chủ
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeTab === 'participating' && stats?.participatingHuiList && (
            <HuiList huis={stats.participatingHuiList} type="participating" />
          )}
          {activeTab === 'owned' && stats?.ownedHuiList && (
            <HuiList huis={stats.ownedHuiList} type="owned" />
          )}
        </div>
      </div>
    </>
  );
}
