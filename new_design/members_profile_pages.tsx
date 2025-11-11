import React, { useState } from 'react';
import { 
  Users, Search, Bell, User, Menu, UserPlus, Check, X,
  Camera, Edit, Shield, Eye, EyeOff, ArrowUpDown, ChevronRight
} from 'lucide-react';

export default function MembersAndProfilePages() {
  const [currentPage, setCurrentPage] = useState('members'); // 'members' or 'profile'
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests' for members page
  const [profileTab, setProfileTab] = useState('info'); // 'info' or 'security' for profile page
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortAZ, setSortAZ] = useState(true);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const friends = [
    { id: 1, name: 'Nguyễn Văn A', email: 'nguyenvana@email.com', initial: 'A' },
    { id: 2, name: 'Trần Thị B', email: 'tranthib@email.com', initial: 'B' },
    { id: 3, name: 'Lê Văn C', email: 'levanc@email.com', initial: 'C' },
    { id: 4, name: 'Phạm Thị D', email: 'phamthid@email.com', initial: 'D' },
    { id: 5, name: 'Hoàng Văn E', email: 'hoangvane@email.com', initial: 'E' },
    { id: 6, name: 'Mai Thị F', email: 'maithif@email.com', initial: 'F' },
  ];

  const receivedRequests = [
    { id: 1, name: 'Đỗ Văn G', email: 'dovang@email.com' },
    { id: 2, name: 'Vũ Thị H', email: 'vuthih@email.com' },
  ];

  const sentRequests = [
    { id: 1, name: 'Bùi Văn I', email: 'buivani@email.com' },
  ];

  const filteredFriends = friends
    .filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));

  const groupedFriends = filteredFriends.reduce((acc, friend) => {
    const letter = friend.name.charAt(0).toUpperCase();
    if (!acc[letter]) acc[letter] = [];
    acc[letter].push(friend);
    return acc;
  }, {});

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
                <button className="px-4 py-2 rounded-lg font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  Danh sách Hụi
                </button>
                <button 
                  onClick={() => setCurrentPage('members')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === 'members' ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
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
              
              <button 
                onClick={() => setCurrentPage('profile')}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
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
        {currentPage === 'members' ? (
          // MEMBERS PAGE
          <div className="flex gap-6">
            {/* Sidebar */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Bạn bè</h2>
                
                <button 
                  onClick={() => setShowAddFriendModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mb-4 font-medium"
                >
                  <UserPlus className="w-4 h-4" />
                  Thêm bạn
                </button>

                <nav className="space-y-1">
                  <button
                    onClick={() => setActiveTab('friends')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'friends'
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Danh sách bạn bè</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  
                  <button
                    onClick={() => setActiveTab('requests')}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'requests'
                        ? 'bg-red-50 text-red-600 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span>Lời mời kết bạn</span>
                    {(receivedRequests.length + sentRequests.length) > 0 && (
                      <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {receivedRequests.length + sentRequests.length}
                      </span>
                    )}
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1">
              {activeTab === 'friends' ? (
                <div className="bg-white rounded-xl border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-gray-800">
                        Danh sách bạn bè ({friends.length})
                      </h2>
                      <button 
                        onClick={() => setSortAZ(!sortAZ)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <ArrowUpDown className="w-4 h-4" />
                        <span className="text-sm font-medium">{sortAZ ? 'A → Z' : 'Z → A'}</span>
                      </button>
                    </div>

                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Tìm kiếm bạn bè..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>

                  <div className="p-6">
                    {Object.keys(groupedFriends).sort().map(letter => (
                      <div key={letter} className="mb-6">
                        <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{letter}</h3>
                        <div className="space-y-2">
                          {groupedFriends[letter].map(friend => (
                            <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {friend.initial}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{friend.name}</p>
                                  <p className="text-sm text-gray-500">{friend.email}</p>
                                </div>
                              </div>
                              <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                                Xem hồ sơ
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Received Requests */}
                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-800">
                        Lời mời đã nhận ({receivedRequests.length})
                      </h2>
                    </div>
                    <div className="p-6 space-y-3">
                      {receivedRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                              {request.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{request.name}</p>
                              <p className="text-sm text-gray-500">{request.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                              <Check className="w-4 h-4" />
                              Chấp nhận
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                              <X className="w-4 h-4" />
                              Từ chối
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sent Requests */}
                  <div className="bg-white rounded-xl border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                      <h2 className="text-xl font-bold text-gray-800">
                        Lời mời đã gửi ({sentRequests.length})
                      </h2>
                    </div>
                    <div className="p-6 space-y-3">
                      {sentRequests.map(request => (
                        <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                              {request.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{request.name}</p>
                              <p className="text-sm text-gray-500">{request.email}</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            Thu hồi lời mời
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          // PROFILE PAGE
          <div className="max-w-4xl mx-auto">
            {/* Profile Header */}
            <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
              <div className="flex items-start gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                    N
                  </div>
                  <button className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="w-8 h-8 text-white" />
                  </button>
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">Nguyễn Văn A</h1>
                  <p className="text-gray-500 mb-2">nguyenvana@email.com</p>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                    ADMIN
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex gap-1 p-2">
                  <button
                    onClick={() => setProfileTab('info')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profileTab === 'info'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setProfileTab('security')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      profileTab === 'security'
                        ? 'bg-red-600 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Bảo mật
                  </button>
                </div>
              </div>

              <div className="p-8">
                {profileTab === 'info' ? (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
                      <button 
                        onClick={() => setIsEditingProfile(!isEditingProfile)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-sm font-medium">
                          {isEditingProfile ? 'Hủy' : 'Chỉnh sửa'}
                        </span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {/* Personal Info */}
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chung</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            {isEditingProfile ? (
                              <input 
                                type="text" 
                                defaultValue="Nguyễn Văn A"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">Nguyễn Văn A</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <p className="text-gray-800">nguyenvana@email.com</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            {isEditingProfile ? (
                              <input 
                                type="tel" 
                                defaultValue="0987654321"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">0987654321</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                            {isEditingProfile ? (
                              <input 
                                type="date" 
                                defaultValue="1990-01-01"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">01/01/1990</p>
                            )}
                          </div>
                          <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
                            {isEditingProfile ? (
                              <textarea 
                                rows={3}
                                defaultValue="Chủ hụi có kinh nghiệm"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">Chủ hụi có kinh nghiệm</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Là thành viên từ</label>
                            <p className="text-gray-800">01/01/2025</p>
                          </div>
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div className="pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin thanh toán</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngân hàng</label>
                            {isEditingProfile ? (
                              <input 
                                type="text" 
                                defaultValue="Vietcombank"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">Vietcombank</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên tài khoản</label>
                            {isEditingProfile ? (
                              <input 
                                type="text" 
                                defaultValue="NGUYEN VAN A"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">NGUYEN VAN A</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
                            {isEditingProfile ? (
                              <input 
                                type="text" 
                                defaultValue="1234567890"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-gray-800">1234567890</p>
                            )}
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mã QR</label>
                            {isEditingProfile ? (
                              <input 
                                type="file" 
                                accept="image/*"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                              />
                            ) : (
                              <p className="text-blue-600 cursor-pointer hover:underline">Xem QR code</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {isEditingProfile && (
                        <div className="flex justify-end pt-4">
                          <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            Lưu tất cả thay đổi
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
                    <div className="max-w-xl space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu hiện tại
                        </label>
                        <div className="relative">
                          <input 
                            type={showCurrentPassword ? "text" : "password"}
                            className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu mới
                        </label>
                        <div className="relative">
                          <input 
                            type={showNewPassword ? "text" : "password"}
                            className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Xác nhận mật khẩu mới
                        </label>
                        <div className="relative">
                          <input 
                            type={showConfirmPassword ? "text" : "password"}
                            className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <button
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end pt-4">
                        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                          Lưu thay đổi
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Add Friend Modal */}
      {showAddFriendModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">Thêm bạn</h2>
                <button onClick={() => setShowAddFriendModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email hoặc số điện thoại
                </label>
                <input 
                  type="text" 
                  placeholder="Nhập email hoặc số điện thoại"
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium mb-4">
                Tìm kiếm
              </button>

              <div className="border-t border-gray-200 pt-4">
                <p className="text-sm text-gray-500 mb-3">Kết quả tìm kiếm</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        K
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 text-sm">Khách hàng mới</p>
                        <p className="text-xs text-gray-500">khach@email.com</p>
                      </div>
                    </div>
                    <button className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                      Gửi lời mời
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowAddFriendModal(false)}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}