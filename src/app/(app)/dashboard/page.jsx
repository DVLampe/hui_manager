'use client';
import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
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
          text: 'Số hụi',
        },
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Lợi nhuận',
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

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/dashboard?groupBy=${groupBy}`);
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Tổng số hụi</p>
                <p className="text-2xl font-bold text-gray-800">{stats.totalHui}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Số hụi đang tham gia</p>
                <p className="text-2xl font-bold text-gray-800">{stats.participatingHui}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Tổng tiền đã trả</p>
                <p className="text-2xl font-bold text-gray-800">{formatVietnameseCurrency(stats.totalPaid)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Tổng tiền đã nhận</p>
                <p className="text-2xl font-bold text-gray-800">{formatVietnameseCurrency(stats.totalReceived)}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
                <p className="text-sm text-gray-500 mb-1">Lợi nhuận</p>
                <p className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatVietnameseCurrency(stats.profitLoss)}
                </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="flex justify-between items-center mb-4">
              <Select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
                className="w-32"
              >
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
                <option value="year">Năm</option>
              </Select>
            </div>
            <div className="relative h-96">
              {stats && stats.monthlyStats ? (
                <Line data={stats.monthlyStats} options={chartOptions} />
              ) : (
                <p>Không có dữ liệu để hiển thị.</p>
              )}
            </div>
          </div>

          {/* Hui List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Thống kê hụi</h2>
            <HuiList huis={stats.huiList} />
          </div>
    </>
  );
}
