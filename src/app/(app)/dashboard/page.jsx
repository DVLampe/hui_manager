'use client';
import { useState, useEffect, useRef } from 'react';
import logger from '@/lib/logger.client';
import dynamic from 'next/dynamic';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import { formatVietnameseCurrency } from '@/lib/utils';
import { HuiList } from '@/components/shared/hui/HuiList';
import StatCard from '@/components/ui/StatCard';
import MobileStatCard from '@/components/mobile/MobileStatCard';
import { useIsMobile } from '@/lib/hooks';
import Link from 'next/link';
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
  const [showExportOptions, setShowExportOptions] = useState(false);
  const isInitialMount = useRef(true);
  const tableRef = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    logger.info("Dashboard page loaded. Starting data fetch.");
    const fetchStats = async () => {
      const isChartUpdate = !isInitialMount.current;
      
      if (isChartUpdate) {
        setIsChartLoading(true);
      } else {
        setLoading(true);
      }

      try {
        logger.info(`Fetching stats with groupBy: ${groupBy}`);
        const response = await fetch(`/api/dashboard?groupBy=${groupBy}`);
        if (!response.ok) {
          const errorText = await response.text();
          logger.error(`Failed to fetch dashboard data. Status: ${response.status}. Body: ${errorText}`);
          throw new Error(`Failed to fetch dashboard data. Status: ${response.status}`);
        }
        const data = await response.json();
        logger.info("Successfully fetched dashboard data:", data);
        setStats(data);
      } catch (err) {
        logger.error("Error in fetchStats:", err);
        setError(err.message);
      } finally {
        logger.info("Finished fetch attempt.");
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

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const huis = activeTab === 'participating' ? stats.participatingHuiList : stats.ownedHuiList;
    const type = activeTab;
    const title = type === 'owned' ? 'Hụi làm chủ' : 'Hụi tham gia';

    const dataToExport = huis.map(hui => ({
        'Tên hụi': hui.name,
        'Trạng thái': hui.status,
        'Số tiền': formatVietnameseCurrency(hui.amount),
        'Số kỳ': hui.ky,
        'Chu kỳ': hui.frequency,
        'Ngày bắt đầu': new Date(hui.startDate).toLocaleDateString(),
        'Ngày kết thúc': new Date(hui.endDate).toLocaleDateString(),
        [type === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ']: formatVietnameseCurrency(type === 'owned' ? hui.totalThao : hui.profit),
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title);
    XLSX.writeFile(wb, `${title}.xlsx`);
    setShowExportOptions(false);
  };

  const handleExportPDF = async () => {
      const { default: jsPDF } = await import('jspdf');
      const { default: html2canvas } = await import('html2canvas');
      setShowExportOptions(false);
      const table = tableRef.current;
      if (!table) return;

      const type = activeTab;
      const title = type === 'owned' ? 'Hụi làm chủ' : 'Hụi tham gia';

      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = 'auto';
      exportContainer.style.width = '1123px';
      exportContainer.style.padding = '20px';
      exportContainer.style.backgroundColor = 'white';

      const header = document.createElement('h2');
      header.textContent = title;
      header.style.fontSize = '1.5rem';
      header.style.fontWeight = '600';
      header.style.marginBottom = '1rem';
      
      const tableClone = table.cloneNode(true);
      
      exportContainer.appendChild(header);
      exportContainer.appendChild(tableClone);
      document.body.appendChild(exportContainer);

      try {
          const canvas = await html2canvas(exportContainer, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.height / imgProps.width;
          let imgHeight = pdfWidth * ratio;
          if (imgHeight > pdfHeight) {
              imgHeight = pdfHeight;
          }
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          pdf.save(`${title}.pdf`);
      } catch (error) {
          console.error("Error generating PDF:", error);
      } finally {
          document.body.removeChild(exportContainer);
      }
  };

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

  if (isMobile) {
    return (
      <div className="pb-24">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {statCards.slice(0, 4).map((stat, idx) => (
            <MobileStatCard
              key={idx}
              label={stat.label}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* Next Payment Alert */}
        <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="font-bold text-gray-800 mb-1 text-sm">Sắp đến hạn đóng góp</p>
              <p className="text-sm text-gray-600">Hụi Gia Đình - 10tr</p>
              <p className="text-xs text-yellow-700 mt-1">Còn 6 ngày (15/11/2025)</p>
            </div>
          </div>
        </div>

        {/* Hui List */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Hụi của bạn</h2>
            <Link href="/hui" className="text-sm text-red-600 font-medium">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            {stats?.participatingHuiList?.slice(0, 3).map(hui => (
              <Link href={`/hui/${hui.id}`} key={hui.id} className="block bg-white rounded-xl p-4 border border-gray-200 shadow-sm active:scale-98 transition-transform">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-gray-800">{hui.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${hui.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {hui.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang chờ'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs">Số tiền</p>
                    <p className="font-bold text-gray-800">{formatVietnameseCurrency(hui.amount)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Kỳ hiện tại</p>
                    <p className="font-medium text-gray-800">{hui.ky}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Kỳ tiếp</p>
                    <p className="font-medium text-gray-800">{new Date(hui.endDate).toLocaleDateString()}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

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
            <div className="relative">
              <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {showExportOptions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                      <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button>
                      <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button>
                  </div>
              )}
            </div>
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
            <HuiList huis={stats.participatingHuiList} type="participating" tableRef={tableRef} />
          )}
          {activeTab === 'owned' && stats?.ownedHuiList && (
            <HuiList huis={stats.ownedHuiList} type="owned" tableRef={tableRef} />
          )}
        </div>
      </div>
    </>
  );
}
