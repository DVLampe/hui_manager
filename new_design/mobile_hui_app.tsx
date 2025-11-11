import React, { useState } from 'react';
import { 
  Users, Calendar, DollarSign, Bell, User, Plus, TrendingUp, 
  Clock, CheckCircle, Settings, Menu, X, Search, ChevronRight,
  Edit, Trash2, QrCode, Dice5, MessageCircle, ArrowLeft,
  Download, Filter, UserPlus, Eye, EyeOff, Mail, Lock, Camera
} from 'lucide-react';

export default function MobileHuiApp() {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedHui, setSelectedHui] = useState(null);
  const [activeTab, setActiveTab] = useState('details');
  const [showPassword, setShowPassword] = useState(false);

  const stats = [
    { label: 'Tổng tiền đã trả', value: '125tr', icon: DollarSign, color: 'red' },
    { label: 'Tổng tiền đã nhận', value: '98tr', icon: TrendingUp, color: 'green' },
    { label: 'Tổng tiền thảo', value: '15,5tr', icon: DollarSign, color: 'yellow' },
    { label: 'Lợi nhuận', value: '-11,5tr', icon: TrendingUp, color: 'orange' },
  ];

  const huiList = [
    { id: 1, name: 'Hụi Gia Đình', status: 'active', amount: '10tr', members: 12, period: '5/12', nextPayment: '01/06/2025' },
    { id: 2, name: 'Hụi Bạn Bè', status: 'active', amount: '5tr', members: 8, period: '3/8', nextPayment: '15/06/2025' },
    { id: 3, name: 'Hụi Đồng Nghiệp', status: 'waiting', amount: '8tr', members: 10, period: '0/10', nextPayment: '20/06/2025' },
    { id: 4, name: 'Hụi Làng', status: 'active', amount: '15tr', members: 15, period: '8/12', nextPayment: '25/05/2025' },
  ];

  const notifications = [
    { id: 1, title: 'Sắp đến hạn thanh toán', message: 'Hụi Gia Đình - còn 3 ngày', time: '2 giờ trước', unread: true },
    { id: 2, title: 'Kỳ mới đã bắt đầu', message: 'Hụi Bạn Bè - Kỳ 4', time: '1 ngày trước', unread: true },
    { id: 3, title: 'Lời mời kết bạn', message: 'Nguyễn Văn B gửi lời mời', time: '2 ngày trước', unread: false },
  ];

  const members = [
    { id: 1, name: 'Nguyễn Văn A', role: 'Chủ hụi' },
    { id: 2, name: 'Trần Thị B', role: 'Thành viên' },
    { id: 3, name: 'Lê Văn C', role: 'Thành viên' },
  ];

  const colorMap = {
    red: 'bg-red-50 text-red-600 border-red-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
    orange: 'bg-orange-50 text-orange-600 border-orange-200',
  };

  // Dashboard Screen
  const DashboardScreen = () => (
    <div className="pb-24">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg border ${colorMap[stat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className="text-lg font-bold text-gray-800">{stat.value}</p>
            </div>
          );
        })}
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
          <button 
            onClick={() => setCurrentScreen('hui-list')}
            className="text-sm text-red-600 font-medium"
          >
            Xem tất cả →
          </button>
        </div>

        <div className="space-y-3">
          {huiList.slice(0, 3).map(hui => (
            <div 
              key={hui.id} 
              onClick={() => {
                setSelectedHui(hui);
                setCurrentScreen('hui-detail');
              }}
              className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm active:scale-98 transition-transform"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-800">{hui.name}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  hui.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                }`}>
                  {hui.status === 'active' ? 'Đang hoạt động' : 'Đang chờ'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Số tiền</p>
                  <p className="font-bold text-gray-800">{hui.amount}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Kỳ hiện tại</p>
                  <p className="font-medium text-gray-800">{hui.period}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs">Kỳ tiếp</p>
                  <p className="font-medium text-gray-800">{hui.nextPayment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Hui List Screen
  const HuiListScreen = () => (
    <div className="pb-24">
      <div className="flex items-center gap-3 mb-6">
        <button className="p-2 bg-gray-50 rounded-lg border border-gray-200">
          <Filter className="w-5 h-5 text-gray-600" />
        </button>
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Tìm hụi..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      <div className="space-y-3">
        {huiList.map(hui => (
          <div 
            key={hui.id}
            onClick={() => {
              setSelectedHui(hui);
              setCurrentScreen('hui-detail');
            }}
            className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm"
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-800">{hui.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                hui.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {hui.status === 'active' ? 'Đang hoạt động' : 'Đang chờ'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm mb-3">
              <div>
                <p className="text-gray-500 text-xs">Số tiền</p>
                <p className="font-bold text-gray-800">{hui.amount}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Kỳ hiện tại</p>
                <p className="font-medium text-gray-800">{hui.period}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs">Thành viên</p>
                <p className="font-medium text-gray-800">{hui.members}</p>
              </div>
            </div>

            <button className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
              Xem chi tiết
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  // Hui Detail Screen
  const HuiDetailScreen = () => (
    <div className="pb-24">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Số tiền mỗi kỳ</p>
          <p className="text-lg font-bold text-gray-800">{selectedHui?.amount}</p>
        </div>
        <div className="bg-white rounded-xl p-3 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1">Số thành viên</p>
          <p className="text-lg font-bold text-gray-800">{selectedHui?.members}</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600">Tiến độ</span>
          <span className="text-sm font-bold text-gray-800">{selectedHui?.period}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-red-600 h-2 rounded-full" style={{width: '42%'}}></div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button className="flex flex-col items-center gap-2 bg-red-600 text-white rounded-xl p-3">
          <TrendingUp className="w-5 h-5" />
          <span className="text-xs font-semibold">Hốt Hụi</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-yellow-500 text-white rounded-xl p-3">
          <Dice5 className="w-5 h-5" />
          <span className="text-xs font-semibold">Quay hụi</span>
        </button>
        <button className="flex flex-col items-center gap-2 bg-green-500 text-white rounded-xl p-3">
          <QrCode className="w-5 h-5" />
          <span className="text-xs font-semibold">QR</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'details' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'
            }`}
          >
            Chi tiết
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'members' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'
            }`}
          >
            Thành viên
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'schedule' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'
            }`}
          >
            Lịch
          </button>
        </div>

        <div className="p-4">
          {activeTab === 'details' && (
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tên Hụi</p>
                <p className="text-gray-800 font-medium">{selectedHui?.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <p className="text-gray-800 font-medium">Đang hoạt động</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p>
                <p className="text-gray-800 font-medium">01/01/2025</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Chu kỳ</p>
                <p className="text-gray-800 font-medium">Tháng</p>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="space-y-3">
              {members.map(member => (
                <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                      <p className="text-xs text-gray-500">{member.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'schedule' && (
            <div className="space-y-3">
              {[1,2,3].map(i => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-gray-800">Kỳ {i}</span>
                    <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-semibold">
                      Hoàn thành
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">01/0{i}/2025</p>
                  <p className="text-sm text-gray-800 mt-1">Người hốt: Nguyễn Văn A</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Profile Screen
  const ProfileScreen = () => (
    <div className="pb-24">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
              N
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center">
              <Camera className="w-4 h-4 text-white" />
            </button>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Nguyễn Văn A</h2>
            <p className="text-sm text-gray-500">nguyenvana@email.com</p>
            <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
              ADMIN
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
            <p className="text-gray-800 font-medium">0987654321</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
            <p className="text-gray-800 font-medium">01/01/1990</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Ngân hàng</p>
            <p className="text-gray-800 font-medium">Vietcombank - 1234567890</p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Edit className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Chỉnh sửa hồ sơ</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Đổi mật khẩu</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Cài đặt</span>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-400" />
        </button>
      </div>
    </div>
  );

  // Auth Screens
  const SignInScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 rounded-2xl mb-4">
            <Users className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Hụi Online</h1>
          <p className="text-gray-500 mt-1">Đăng nhập vào tài khoản</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xl">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="email" 
                  placeholder="your@email.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5 text-gray-400" /> : <Eye className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setCurrentScreen('dashboard')}
              className="w-full py-3 bg-red-600 text-white rounded-lg font-semibold"
            >
              Đăng nhập
            </button>

            <div className="text-center">
              <button className="text-sm text-red-600 font-medium">Quên mật khẩu?</button>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Chưa có tài khoản?{' '}
            <button className="text-red-600 font-semibold">Đăng ký ngay</button>
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto bg-gray-50 min-h-screen">
      {currentScreen === 'signin' ? (
        <SignInScreen />
      ) : (
        <>
          {/* Header */}
          <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
            <div className="p-4">
              <div className="flex items-center justify-between">
                {currentScreen === 'dashboard' ? (
                  <>
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-gray-800">Hụi Online</h1>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setShowNotifications(true)}
                        className="relative p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <Bell className="w-6 h-6 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                      </button>
                      <button 
                        onClick={() => setShowMenu(true)}
                        className="p-2 hover:bg-gray-50 rounded-lg"
                      >
                        <Menu className="w-6 h-6 text-gray-600" />
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button 
                      onClick={() => {
                        if (currentScreen === 'hui-detail') {
                          setCurrentScreen('hui-list');
                        } else {
                          setCurrentScreen('dashboard');
                        }
                      }}
                      className="flex items-center gap-2 text-gray-700"
                    >
                      <ArrowLeft className="w-6 h-6" />
                      <span className="font-medium">Quay lại</span>
                    </button>
                    <button 
                      onClick={() => setShowMenu(true)}
                      className="p-2 hover:bg-gray-50 rounded-lg"
                    >
                      <Menu className="w-6 h-6 text-gray-600" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="p-4">
            {currentScreen === 'dashboard' && <DashboardScreen />}
            {currentScreen === 'hui-list' && <HuiListScreen />}
            {currentScreen === 'hui-detail' && <HuiDetailScreen />}
            {currentScreen === 'profile' && <ProfileScreen />}
          </main>

          {/* Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom">
            <div className="max-w-md mx-auto grid grid-cols-4 gap-1 p-2">
              <button 
                onClick={() => setCurrentScreen('dashboard')}
                className={`flex flex-col items-center py-2 rounded-lg ${
                  currentScreen === 'dashboard' ? 'text-red-600 bg-red-50' : 'text-gray-500'
                }`}
              >
                <Users className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Trang chủ</span>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('hui-list')}
                className={`flex flex-col items-center py-2 rounded-lg ${
                  currentScreen === 'hui-list' ? 'text-red-600 bg-red-50' : 'text-gray-500'
                }`}
              >
                <Calendar className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Hụi</span>
              </button>
              
              <button className="flex flex-col items-center py-2 rounded-lg text-gray-500">
                <UserPlus className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Bạn bè</span>
              </button>
              
              <button 
                onClick={() => setCurrentScreen('profile')}
                className={`flex flex-col items-center py-2 rounded-lg ${
                  currentScreen === 'profile' ? 'text-red-600 bg-red-50' : 'text-gray-500'
                }`}
              >
                <User className="w-6 h-6 mb-1" />
                <span className="text-xs font-semibold">Cá nhân</span>
              </button>
            </div>
          </nav>

          {/* Side Menu */}
          {showMenu && (
            <div className="fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowMenu(false)}
              ></div>
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-xl font-bold text-gray-800">Menu</h2>
                    <button 
                      onClick={() => setShowMenu(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button 
                      onClick={() => {
                        setCurrentScreen('dashboard');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Users className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Bảng thống kê</span>
                    </button>

                    <button 
                      onClick={() => {
                        setCurrentScreen('hui-list');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <Calendar className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Danh sách Hụi</span>
                    </button>

                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <UserPlus className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Bạn bè</span>
                    </button>

                    <button 
                      onClick={() => {
                        setCurrentScreen('profile');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50"
                    >
                      <User className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Hồ sơ</span>
                    </button>

                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50">
                      <Settings className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-800">Cài đặt</span>
                    </button>

                    <div className="border-t border-gray-200 my-4"></div>

                    <button 
                      onClick={() => {
                        setCurrentScreen('signin');
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-red-50 text-red-600"
                    >
                      <span className="font-medium">Đăng xuất</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notifications Panel */}
          {showNotifications && (
            <div className="fixed inset-0 z-50">
              <div 
                className="absolute inset-0 bg-black/50"
                onClick={() => setShowNotifications(false)}
              ></div>
              <div className="absolute top-0 right-0 bottom-0 w-80 bg-white shadow-xl">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Thông báo</h2>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    {notifications.map(notif => (
                      <div 
                        key={notif.id}
                        className={`p-4 rounded-lg border ${
                          notif.unread 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-bold text-gray-800 text-sm">{notif.title}</h3>
                          {notif.unread && (
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{notif.message}</p>
                        <p className="text-xs text-gray-500">{notif.time}</p>
                      </div>
                    ))}
                  </div>

                  <button className="w-full mt-4 py-2 text-center text-sm text-red-600 font-medium">
                    Đánh dấu đã đọc tất cả
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Floating Add Button */}
          {currentScreen === 'hui-list' && (
            <button className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40">
              <Plus className="w-7 h-7" />
            </button>
          )}

          {/* Floating Chat Button */}
          {currentScreen === 'hui-detail' && (
            <button className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40">
              <MessageCircle className="w-6 h-6" />
            </button>
          )}
        </>
      )}
    </div>
  );
}