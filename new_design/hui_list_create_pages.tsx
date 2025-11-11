import React, { useState } from 'react';
import { 
  Plus, Filter, ArrowUpDown, Users, Calendar, DollarSign,
  Clock, CheckCircle, Search, Bell, User, Menu, X, UserPlus
} from 'lucide-react';

export default function HuiListAndCreatePages() {
  const [currentPage, setCurrentPage] = useState('list'); // 'list' or 'create'
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('nearest');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searchMember, setSearchMember] = useState('');

  const huiList = [
    { id: 1, name: 'Hụi Gia Đình', status: 'active', amount: '10tr', members: 12, period: '5/12', nextPayment: '01/06/2025' },
    { id: 2, name: 'Hụi Bạn Bè', status: 'active', amount: '5tr', members: 8, period: '3/8', nextPayment: '15/06/2025' },
    { id: 3, name: 'Hụi Đồng Nghiệp', status: 'waiting', amount: '8tr', members: 10, period: '0/10', nextPayment: '20/06/2025' },
    { id: 4, name: 'Hụi Làng', status: 'active', amount: '15tr', members: 15, period: '8/12', nextPayment: '25/05/2025' },
    { id: 5, name: 'Hụi Tết', status: 'closed', amount: '20tr', members: 10, period: '10/10', nextPayment: '-' },
    { id: 6, name: 'Hụi Sinh Nhật', status: 'active', amount: '7tr', members: 7, period: '2/7', nextPayment: '10/06/2025' },
  ];

  const friends = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com' },
  ];

  const filteredHuiList = huiList.filter(hui => {
    if (statusFilter === 'all') return true;
    return hui.status === statusFilter;
  });

  const toggleMember = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== memberId));
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name.toLowerCase().includes(searchMember.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchMember.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-800">Hụi Online</span>
              </div>
              
              <nav className="hidden md:flex items-center gap-1">
                <button className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Bảng thống kê
                </button>
                <button className="px-4 py-2 rounded-lg font-medium bg-red-50 text-red-600 transition-colors">
                  Danh sách Hụi
                </button>
                <button className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Bạn bè
                </button>
              </nav>
            </div>

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

      <main className="max-w-7xl mx-auto px-6 py-8">
        {currentPage === 'list' ? (
          // LIST PAGE
          <div>
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Danh sách Hụi</h1>
                <p className="text-gray-500 mt-1">Quản lý tất cả các hụi của bạn</p>
              </div>
              <button 
                onClick={() => setCurrentPage('create')}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-xl font-medium"
              >
                <Plus className="w-5 h-5" />
                Tạo Hụi Mới
              </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-500" />
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="active">Đang hoạt động</option>
                  <option value="waiting">Đang chờ</option>
                  <option value="closed">Đã đóng</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-5 h-5 text-gray-500" />
                <select 
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                >
                  <option value="nearest">Gần nhất</option>
                  <option value="farthest">Xa nhất</option>
                </select>
              </div>
            </div>

            {/* Hui Cards Grid */}
            {filteredHuiList.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredHuiList.map(hui => (
                  <div key={hui.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-800">{hui.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          hui.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : hui.status === 'waiting'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {hui.status === 'active' ? 'Đang hoạt động' : hui.status === 'waiting' ? 'Đang chờ' : 'Đã đóng'}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Số tiền</span>
                          <span className="font-bold text-gray-800">{hui.amount}</span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-gray-100">
                          <span className="text-sm text-gray-500">Kỳ hiện tại</span>
                          <span className="font-medium text-gray-800">{hui.period}</span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm text-gray-500">Thanh toán kế tiếp</span>
                          <span className="font-medium text-gray-800">{hui.nextPayment}</span>
                        </div>
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                      <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Bạn chưa tham gia hoặc quản lý hụi nào</h3>
                <p className="text-gray-500 mb-6">Tạo hụi đầu tiên của bạn để bắt đầu</p>
                <button 
                  onClick={() => setCurrentPage('create')}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Tạo Hụi Đầu Tiên
                </button>
              </div>
            )}
          </div>
        ) : (
          // CREATE PAGE
          <div>
            {/* Page Header */}
            <div className="mb-8">
              <button 
                onClick={() => setCurrentPage('list')}
                className="text-gray-600 hover:text-gray-800 mb-4"
              >
                ← Quay lại
              </button>
              <h1 className="text-3xl font-bold text-gray-800">Tạo Hụi Mới</h1>
              <p className="text-gray-500 mt-1">Điền thông tin để tạo hụi mới</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-6">Thông tin cơ bản</h2>
                  
                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tên hụi <span className="text-red-600">*</span>
                      </label>
                      <input 
                        type="text" 
                        placeholder="Nhập tên hụi" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mô tả
                      </label>
                      <textarea 
                        placeholder="Mô tả về hụi này..." 
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số tiền mỗi kỳ <span className="text-red-600">*</span>
                        </label>
                        <input 
                          type="text" 
                          placeholder="0" 
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Loại hụi <span className="text-red-600">*</span>
                        </label>
                        <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white">
                          <option>Ngày</option>
                          <option>Tuần</option>
                          <option>Tháng</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày bắt đầu <span className="text-red-600">*</span>
                        </label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Ngày kết thúc
                        </label>
                        <input 
                          type="date" 
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Số kỳ <span className="text-red-600">*</span>
                      </label>
                      <input 
                        type="number" 
                        placeholder="12" 
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Members Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Thêm thành viên</h2>
                    <span className="text-sm text-gray-500">({selectedMembers.length} đã chọn)</span>
                  </div>

                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm bạn bè..." 
                        value={searchMember}
                        onChange={(e) => setSearchMember(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {filteredFriends.map(friend => (
                      <div 
                        key={friend.id}
                        onClick={() => toggleMember(friend.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedMembers.includes(friend.id)
                            ? 'bg-red-50 border-red-200'
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                            {friend.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{friend.name}</p>
                            <p className="text-xs text-gray-500">{friend.email}</p>
                          </div>
                          {selectedMembers.includes(friend.id) && (
                            <CheckCircle className="w-5 h-5 text-red-600" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex items-center justify-end gap-4 bg-white rounded-xl border border-gray-200 p-6">
              <button 
                onClick={() => setCurrentPage('list')}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
              <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl">
                Tạo Hụi
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}