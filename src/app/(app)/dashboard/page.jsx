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
  PieChart, Download, ChevronDown, Calendar, Plus
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

    // Helper function to get status translation for Excel
    const getStatusText = (status) => {
        const { getHuiStatusDisplayText } = require('@/lib/huiStatus');
        return getHuiStatusDisplayText(status);
    };
    
    // Helper function to get frequency translation for Excel
    const getFrequencyText = (frequency) => {
        switch (frequency) {
            case 'DAILY': return 'Hàng ngày';
            case 'WEEKLY': return 'Hàng tuần';
            case 'MONTHLY': return 'Hàng tháng';
            default: return frequency;
        }
    };

    const dataToExport = huis.map(hui => ({
        'Tên hụi': hui.name,
        'Trạng thái': getStatusText(hui.status),
        'Số tiền': formatVietnameseCurrency(hui.amount),
        'Số kỳ': hui.ky,
        'Chu kỳ': getFrequencyText(hui.frequency),
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
      
      const type = activeTab;
      const title = type === 'owned' ? 'Hụi làm chủ' : 'Hụi tham gia';
      const huis = activeTab === 'participating' ? stats.participatingHuiList : stats.ownedHuiList;

      // Create a complete export container without scroll limitations
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'absolute';
      exportContainer.style.left = '-9999px';
      exportContainer.style.top = 'auto';
      exportContainer.style.width = '1123px';
      exportContainer.style.padding = '20px';
      exportContainer.style.backgroundColor = 'white';
      exportContainer.style.fontFamily = 'system-ui, -apple-system, sans-serif';

      const header = document.createElement('h2');
      header.textContent = title;
      header.style.fontSize = '1.5rem';
      header.style.fontWeight = '600';
      header.style.marginBottom = '1rem';
      header.style.color = '#1f2937';
      
      // Create a full table without height restrictions
      const tableWrapper = document.createElement('div');
      tableWrapper.style.width = '100%';
      
      const table = document.createElement('table');
      table.style.minWidth = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.border = '1px solid #e5e7eb';
      
      // Create table header
      const thead = document.createElement('thead');
      thead.style.backgroundColor = '#f9fafb';
      const headerRow = document.createElement('tr');
      
      const headers = ['Tên hụi', 'Trạng thái', 'Số tiền', 'Số kỳ', 'Chu kỳ', 'Ngày bắt đầu', 'Ngày kết thúc', type === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ'];
      headers.forEach(headerText => {
          const th = document.createElement('th');
          th.textContent = headerText;
          th.style.padding = '12px 8px';
          th.style.textAlign = 'left';
          th.style.fontSize = '14px';
          th.style.fontWeight = '600';
          th.style.color = '#374151';
          th.style.border = '1px solid #e5e7eb';
          headerRow.appendChild(th);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);
      
      // Create table body with all data
      const tbody = document.createElement('tbody');
      tbody.style.backgroundColor = 'white';
      
      // Helper function to get status translation
      const getStatusText = (status) => {
          const { getHuiStatusDisplayText } = require('@/lib/huiStatus');
          return getHuiStatusDisplayText(status);
      };
      
      // Helper function to get frequency translation
      const getFrequencyText = (frequency) => {
          switch (frequency) {
              case 'DAILY': return 'Hàng ngày';
              case 'WEEKLY': return 'Hàng tuần';
              case 'MONTHLY': return 'Hàng tháng';
              default: return frequency;
          }
      };
      
      huis.forEach(hui => {
          const row = document.createElement('tr');
          row.style.borderBottom = '1px solid #e5e7eb';
          
          const cells = [
              { text: hui.name, color: '#dc2626' }, // red-600 for name
              { text: getStatusText(hui.status), color: '#374151' }, // default color for status
              { text: formatVietnameseCurrency(hui.amount), color: '#374151' },
              { text: hui.ky, color: '#374151' },
              { text: getFrequencyText(hui.frequency), color: '#374151' },
              { text: new Date(hui.startDate).toLocaleDateString('vi-VN'), color: '#374151' },
              { text: new Date(hui.endDate).toLocaleDateString('vi-VN'), color: '#374151' },
              { 
                  text: formatVietnameseCurrency(type === 'owned' ? hui.totalThao : hui.profit),
                  color: type === 'owned' ? '#2563eb' : (hui.profit >= 0 ? '#16a34a' : '#dc2626') // blue for owned, green/red for profit/loss
              }
          ];
          
          cells.forEach((cell, index) => {
              const td = document.createElement('td');
              td.textContent = cell.text;
              td.style.padding = '12px 8px';
              td.style.fontSize = '13px';
              td.style.color = cell.color;
              td.style.border = '1px solid #e5e7eb';
              if (index === 0) td.style.fontWeight = '500'; // First column (name) bold
              
              // Add status badge styling for status column
              if (index === 1) {
                  td.style.fontWeight = '500';
                  // Add background color for status
                  const statusUpper = hui.status?.toUpperCase();
                  switch (statusUpper) {
                      case 'ACTIVE':
                          td.style.backgroundColor = '#dcfce7';
                          td.style.color = '#166534';
                          break;
                      case 'PENDING':
                          td.style.backgroundColor = '#fef3c7';
                          td.style.color = '#92400e';
                          break;
                      case 'COMPLETED':
                          td.style.backgroundColor = '#dbeafe';
                          td.style.color = '#1e40af';
                          break;
                      case 'CANCELLED':
                          td.style.backgroundColor = '#fecaca';
                          td.style.color = '#991b1b';
                          break;
                      default:
                          td.style.backgroundColor = '#f3f4f6';
                          td.style.color = '#374151';
                  }
                  td.style.borderRadius = '6px';
                  td.style.textAlign = 'center';
              }
              
              row.appendChild(td);
          });
          
          tbody.appendChild(row);
      });
      
      table.appendChild(tbody);
      tableWrapper.appendChild(table);
      
      exportContainer.appendChild(header);
      exportContainer.appendChild(tableWrapper);
      document.body.appendChild(exportContainer);

      try {
          const canvas = await html2canvas(exportContainer, { 
              scale: 2,
              useCORS: true,
              allowTaint: true,
              width: exportContainer.scrollWidth,
              height: exportContainer.scrollHeight
          });
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4');
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgProps = pdf.getImageProperties(imgData);
          const ratio = imgProps.height / imgProps.width;
          let imgHeight = pdfWidth * ratio;
          
          // Handle multiple pages if content is too tall
          if (imgHeight > pdfHeight) {
              const pages = Math.ceil(imgHeight / pdfHeight);
              for (let i = 0; i < pages; i++) {
                  if (i > 0) pdf.addPage();
                  const srcY = (canvas.height / pages) * i;
                  const srcHeight = canvas.height / pages;
                  const pageCanvas = document.createElement('canvas');
                  const pageCtx = pageCanvas.getContext('2d');
                  pageCanvas.width = canvas.width;
                  pageCanvas.height = srcHeight;
                  pageCtx.drawImage(canvas, 0, srcY, canvas.width, srcHeight, 0, 0, canvas.width, srcHeight);
                  const pageImgData = pageCanvas.toDataURL('image/png');
                  pdf.addImage(pageImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
              }
          } else {
              pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
          }
          
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
        {stats?.nearestPayment ? (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 mb-1 text-sm">Sắp đến hạn đóng hụi</p>
                <p className="text-sm text-gray-600">{stats.nearestPayment.huiName} - {formatVietnameseCurrency(stats.nearestPayment.amount)}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {stats.nearestPayment.daysLeft === 0 
                    ? `Hôm nay (${new Date(stats.nearestPayment.dueDate).toLocaleDateString('vi-VN')})` 
                    : `Còn ${stats.nearestPayment.daysLeft} ngày (${new Date(stats.nearestPayment.dueDate).toLocaleDateString('vi-VN')})`
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 mb-1 text-sm">Tuyệt vời!</p>
                <p className="text-sm text-gray-600">Bạn không có khoản đóng góp nào sắp đến hạn.</p>
              </div>
            </div>
          </div>
        )}

        {/* Hui List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">Hụi của bạn</h2>
              <Link href="/hui" className="text-sm font-medium text-red-600 hover:underline">
                Xem thêm hụi
              </Link>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => setActiveTab('participating')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 ${
                  activeTab === 'participating' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hụi tham gia
              </button>
              <button 
                onClick={() => setActiveTab('owned')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors text-sm flex-1 ${
                  activeTab === 'owned' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hụi làm chủ
              </button>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-3">
              {(activeTab === 'participating' ? stats.participatingHuiList : stats.ownedHuiList)?.slice(0, 5).map(hui => (
                <Link href={`/hui/${hui.id}`} key={hui.id} className="block bg-white rounded-xl p-4 border border-gray-200 shadow-sm active:scale-98 transition-transform">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-gray-800">{hui.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      (() => {
                        const { getHuiStatusColor } = require('@/lib/huiStatus');
                        return getHuiStatusColor(hui.status);
                      })()
                    }`}>
                      {(() => {
                        const { getHuiStatusDisplayText } = require('@/lib/huiStatus');
                        return getHuiStatusDisplayText(hui.status);
                      })()}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Số tiền</p>
                      <p className="font-bold text-gray-800">{formatVietnameseCurrency(hui.amount)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Kỳ</p>
                      <p className="font-medium text-gray-800">{hui.ky}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">{activeTab === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận'}</p>
                      <p className="font-medium text-gray-800">{formatVietnameseCurrency(activeTab === 'owned' ? hui.totalThao : hui.profit)}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
        <Link href="/hui/create">
          <button className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40">
            <Plus className="w-7 h-7" />
          </button>
        </Link>
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

      {/* Payment Alert and Create Button Section */}
      <div className="relative mb-8">
        {/* Next Payment Alert - Longer, reaching to center */}
        {stats?.nearestPayment ? (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-l-4 border-yellow-500 rounded-lg p-2 shadow-sm w-1/3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 mb-1 text-sm">Sắp đến hạn đóng hụi - 
                  <span className="font-normal text-gray-600 text-sm"> {stats.nearestPayment.huiName}</span>
                </p>
                <p className="font-medium text-gray-800 text-sm">{formatVietnameseCurrency(stats.nearestPayment.amount)}</p>
                <p className="text-xs text-yellow-700 mt-1">
                  {stats.nearestPayment.daysLeft === 0 
                    ? `Hôm nay (${new Date(stats.nearestPayment.dueDate).toLocaleDateString('vi-VN')})` 
                    : `Còn ${stats.nearestPayment.daysLeft} ngày (${new Date(stats.nearestPayment.dueDate).toLocaleDateString('vi-VN')})`
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-green-100 border-l-4 border-green-500 rounded-lg p-2 shadow-sm w-1/3">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-bold text-gray-800 mb-1 text-sm">Tuyệt vời!</p>
                <p className="text-sm text-gray-600">Không có khoản đóng góp nào sắp đến hạn.</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Create New Hui Button - Absolutely centered */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Link href="/hui/create">
            <button className="flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl font-medium text-lg">
              <Plus className="w-6 h-6" />
              Tạo Hụi Mới
            </button>
          </Link>
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
