import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Clock, DollarSign, 
  PieChart, Download, ChevronDown, Bell, User, 
  Search, Menu, Plus, Calendar
} from 'lucide-react';

export default function HuiWebDashboard() {
  const [timeGroup, setTimeGroup] = useState('month');
  const [activeTab, setActiveTab] = useState('participating');
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Mock data
  const stats = [
    { label: 'Tổng tiền đã trả', value: '125tr', icon: DollarSign, color: 'red' },
    { label: 'Tổng tiền đã nhận', value: '98tr', icon: TrendingUp, color: 'green' },
    { label: 'Tổng tiền thảo', value: '15,5tr', icon: PieChart, color: 'yellow' },
    { label: 'Lợi nhuận', value: '-11,5tr', icon: TrendingDown, color: 'orange' },
    { label: 'Tổng số hụi', value: '8', icon: Users, color: 'blue' },
    { label: 'Số hụi đang tham gia', value: '5', icon: Clock, color: 'purple' },
    { label: 'Kỳ sắp tới', value: '3', icon: Calendar, color: 'pink' },
    { label: 'Tổng thành viên', value: '42', icon: Users, color: 'indigo' }
  ];

  const huiList = [
    { id: 1, name: 'Hụi Gia Đình', status: 'active', amount: '10tr', profit: '+2,5tr', period: '5/12' },
    { id: 2, name: 'Hụi Bạn Bè', status: 'active', amount: '5tr', profit: '-1,2tr', period: '3/8' },
    { id: 3, name: 'Hụi Đồng Nghiệp', status: 'waiting', amount: '8tr', profit: '+0,5tr', period: '0/10' },
    { id: 4, name: 'Hụi Làng', status: 'active', amount: '15tr', profit: '-3tr', period: '8/12' },
  ];

  const colorMap = {
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    pink: 'bg-pink-50 text-pink-600 border-pink-200',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Navigation */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Hụi Online</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <button 
                  onClick={() => setCurrentPage('dashboard')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'dashboard' 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bảng thống kê
                </button>
                <button 
                  onClick={() => setCurrentPage('hui')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'hui' 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Danh sách Hụi
                </button>
                <button 
                  onClick={() => setCurrentPage('members')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'members' 
                      ? 'bg-red-50 text-red-600' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  Bạn bè
                </button>
              </nav>
            </div>

            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gray-50 rounded-lg px-4 py-2">
                <Search className="w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Tìm kiếm..." 
                  className="bg-transparent border-none outline-none text-sm w-64"
                />
              </div>
              
              <button className="relative p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </button>
              
              <button className="md:hidden p-2 hover:bg-gray-50 rounded-lg">
                <Menu className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Bảng thống kê</h1>
          <p className="text-gray-500 mt-1">Tổng quan hoạt động tài chính của bạn</p>
        </div>

        {/* Stats Grid - 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-4 border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg border ${colorMap[stat.color]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-gray-800">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Chart Section */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Biểu đồ thống kê</h2>
            <div className="flex items-center gap-2">
              <select 
                value={timeGroup}
                onChange={(e) => setTimeGroup(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="day">Ngày</option>
                <option value="month">Tháng</option>
                <option value="year">Năm</option>
              </select>
            </div>
          </div>
          
          <div className="h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <PieChart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-400">Biểu đồ sẽ hiển thị ở đây</p>
            </div>
          </div>
        </div>

        {/* Hui Lists Section */}
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
                onClick={() => setActiveTab('owning')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'owning' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Hụi làm chủ
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Tên hụi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Kỳ hiện tại
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    {activeTab === 'participating' ? 'Lợi nhuận/Thua lỗ' : 'Tổng tiền thảo'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {huiList.map((hui) => (
                  <tr key={hui.id} className="hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-800">{hui.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        hui.status === 'active' 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {hui.status === 'active' ? 'Đang hoạt động' : 'Đang chờ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">
                      {hui.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {hui.period}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${
                        hui.profit.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {hui.profit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                        Xem chi tiết →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}