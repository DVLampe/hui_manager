'use client';
import { useState, useEffect, useRef } from 'react';
import logger from '@/lib/logger.client';
import dynamic from 'next/dynamic';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import zoomPlugin from 'chartjs-plugin-zoom';
import { Badge } from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { formatVietnameseCurrency } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { HuiList } from '@/components/shared/hui/HuiList';
import Select from '@/components/ui/Select';

const DynamicLineChart = dynamic(() => import('react-chartjs-2').then((mod) => mod.Line), {
  ssr: false,
  loading: () => <div className="h-full flex items-center justify-center"><p>Loading chart...</p></div>
});

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  zoomPlugin
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Số tiền (VNĐ)',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Số hụi',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
    plugins: {
      zoom: {
        pan: {
          enabled: true,
          mode: 'x',
        },
        zoom: {
          wheel: {
            enabled: true,
          },
          pinch: {
            enabled: true
          },
          mode: 'x',
        }
      }
    }
  };

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

  return (
    <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Bảng thống kê</h1>
          </div>

          {/* Stats Cards */}
          <div className="space-y-4 mb-8">
            {/* Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền đã trả</p>
                  <p className="text-2xl font-bold text-gray-800">{formatVietnameseCurrency(stats.totalPaid)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền đã nhận</p>
                  <p className="text-2xl font-bold text-gray-800">{formatVietnameseCurrency(stats.totalReceived)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Tổng tiền thảo</p>
                  <p className="text-2xl font-bold text-blue-600">{formatVietnameseCurrency(stats.totalThao)}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Lợi nhuận</p>
                  <p className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatVietnameseCurrency(stats.profitLoss)}
                  </p>
              </div>
            </div>
            {/* Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:w-1/2 lg:mx-auto">
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Tổng số hụi</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalHui}</p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                  <p className="text-sm text-gray-500 mb-1">Số hụi đang tham gia</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.participatingHui}</p>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-32"
                variant="minimal"
              >
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
                <option value="year">Năm</option>
              </Select>
            </div>
            <div className="relative h-96">
              {isChartLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-lg">
                  <Loading message="Đang tải biểu đồ..." />
                </div>
              )}
              {stats && stats.monthlyStats ? (
                <DynamicLineChart data={stats.monthlyStats} options={chartOptions} />
              ) : (
                !isChartLoading && <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>
          </div>

          {/* Hui List */}
          <div className="mt-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                <button
                  onClick={() => setActiveTab('participating')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'participating'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hụi tham gia
                </button>
                <button
                  onClick={() => setActiveTab('owned')}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'owned'
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Hụi làm chủ
                </button>
              </nav>
            </div>
            <div className="mt-6">
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
