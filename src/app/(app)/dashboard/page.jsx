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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { formatVietnameseCurrency } from '@/lib/utils';
import Link from 'next/link';
import Button from '@/components/ui/Button';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
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
          text: 'Lợi nhuận/Thua lỗ (VND)',
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard');
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
  }, []);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  return (
    <>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Bảng điều khiển</h1>
            <p className="text-gray-500 mt-1">
              Thống kê cá nhân của bạn về việc tham gia hụi.
            </p>
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
                <p className="text-sm text-gray-500 mb-1">Lợi nhuận/Thua lỗ</p>
                <p className={`text-2xl font-bold ${stats.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatVietnameseCurrency(stats.profitLoss)}
                </p>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 h-96">
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Thống kê hàng tháng</h2>
            <div className="relative h-full">
              <Line data={stats.monthlyStats} options={chartOptions} />
            </div>
          </div>

          {/* Hui List */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-4">Danh sách hụi</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tên</TableHead>
                    <TableHead>Số kỳ</TableHead>
                    <TableHead>Số tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Lợi nhuận/Thua lỗ</TableHead>
                    <TableHead>Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.huiList.map((hui) => (
                    <TableRow key={hui.id}>
                      <TableCell>{hui.name}</TableCell>
                      <TableCell>{hui.ky}</TableCell>
                      <TableCell>{formatVietnameseCurrency(hui.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={hui.status === 'active' ? 'default' : 'secondary'}>
                          {hui.status}
                        </Badge>
                      </TableCell>
                      <TableCell className={hui.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatVietnameseCurrency(hui.profit)}
                      </TableCell>
                      <TableCell>
                        <Link href={`/hui/${hui.id}`}>
                          <Button variant="primary" size="sm">Xem chi tiết</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
    </>
  );
}
