import React, { useState } from 'react';
import { 
  Users, Calendar, DollarSign, Edit, Trash2, Download, 
  ChevronDown, X, QrCode, Dice5, MessageCircle, Shield,
  Clock, CheckCircle, AlertCircle, TrendingUp, FileText,
  UserPlus, Eye
} from 'lucide-react';

export default function HuiDetailPage() {
  const [activeTab, setActiveTab] = useState('details');
  const [showHotModal, setShowHotModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState(1);

  const huiData = {
    name: 'Hụi Gia Đình',
    description: 'Hụi gia đình hàng tháng, số tiền cố định',
    amount: '10tr',
    members: 12,
    frequency: 'Tháng',
    status: 'Đang hoạt động',
    currentPeriod: 5,
    totalPeriods: 12,
    startDate: '01/01/2025',
    endDate: '31/12/2025',
    owner: 'Nguyễn Văn A',
    nextPayment: '01/06/2025'
  };

  const members = [
    { id: 1, name: 'Nguyễn Văn A', role: 'Chủ hụi', status: 'active', hasReceived: true },
    { id: 2, name: 'Trần Thị B', role: 'Thành viên', status: 'active', hasReceived: false },
    { id: 3, name: 'Lê Văn C', role: 'Thành viên', status: 'active', hasReceived: true },
    { id: 4, name: 'Phạm Thị D', role: 'Thành viên', status: 'active', hasReceived: false },
    { id: 5, name: 'Hoàng Văn E', role: 'Admin', status: 'active', hasReceived: false },
  ];

  const paymentSchedule = [
    { period: 1, date: '01/01/2025', recipient: 'Nguyễn Văn A', thamKeu: '500k', thao: '100k', amount: '9,4tr', status: 'completed' },
    { period: 2, date: '01/02/2025', recipient: 'Trần Thị B', thamKeu: '600k', thao: '120k', amount: '9,28tr', status: 'completed' },
    { period: 3, date: '01/03/2025', recipient: 'Lê Văn C', thamKeu: '550k', thao: '110k', amount: '9,34tr', status: 'completed' },
    { period: 4, date: '01/04/2025', recipient: 'Phạm Thị D', thamKeu: '700k', thao: '140k', amount: '9,16tr', status: 'completed' },
    { period: 5, date: '01/05/2025', recipient: 'Hoàng Văn E', thamKeu: '650k', thao: '130k', amount: '9,22tr', status: 'pending' },
    { period: 6, date: '01/06/2025', recipient: '-', thamKeu: '-', thao: '-', amount: '-', status: 'upcoming' },
  ];

  const detailedPayments = [
    { member: 'Nguyễn Văn A', amount: '10tr', status: 'hụi chết', paid: true },
    { member: 'Trần Thị B', amount: '9,4tr', status: 'hụi sống', paid: true },
    { member: 'Lê Văn C', amount: '9,4tr', status: 'hụi chết', paid: true },
    { member: 'Phạm Thị D', amount: '9,4tr', status: 'hụi sống', paid: false },
    { member: 'Hoàng Văn E', amount: '9,4tr', status: 'hụi sống', paid: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button className="text-gray-600 hover:text-gray-800">
                ← Quay lại
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{huiData.name}</h1>
                <p className="text-sm text-gray-500">Quản lý chi tiết hụi</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <Edit className="w-4 h-4" />
                <span className="text-sm font-medium">Chỉnh sửa hụi</span>
              </button>
              <button 
                onClick={() => setShowDeleteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm font-medium">Xóa hụi</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                <DollarSign className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Số tiền mỗi kỳ</p>
                <p className="text-xl font-bold text-gray-800">{huiData.amount}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Số thành viên</p>
                <p className="text-xl font-bold text-gray-800">{huiData.members}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Chu kỳ</p>
                <p className="text-xl font-bold text-gray-800">{huiData.frequency}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Trạng thái hụi</p>
                <p className="text-base font-bold text-green-600">{huiData.status}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600">Tiến độ</span>
            <span className="text-sm font-bold text-gray-800">
              Kỳ {huiData.currentPeriod}/{huiData.totalPeriods}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all"
              style={{ width: `${(huiData.currentPeriod / huiData.totalPeriods) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {Math.round((huiData.currentPeriod / huiData.totalPeriods) * 100)}% hoàn thành
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <button 
            onClick={() => setShowHotModal(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl p-4 hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl"
          >
            <TrendingUp className="w-5 h-5" />
            <span className="font-semibold">Hốt Hụi</span>
          </button>
          
          <button className="flex items-center justify-center gap-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-4 hover:from-yellow-600 hover:to-yellow-700 transition-all shadow-lg hover:shadow-xl">
            <Dice5 className="w-5 h-5" />
            <span className="font-semibold">Quay hụi</span>
          </button>
          
          <button 
            onClick={() => setShowQRModal(true)}
            className="flex items-center justify-center gap-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-4 hover:from-green-600 hover:to-green-700 transition-all shadow-lg hover:shadow-xl"
          >
            <QrCode className="w-5 h-5" />
            <span className="font-semibold">QR chuyển khoản</span>
          </button>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Thông tin chi tiết
              </button>
              <button
                onClick={() => setActiveTab('members')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'members'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Danh sách thành viên
              </button>
              <button
                onClick={() => setActiveTab('schedule')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'schedule'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Lịch thanh toán
              </button>
              <button
                onClick={() => setActiveTab('detailed')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'detailed'
                    ? 'bg-red-600 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Lịch chi tiết
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Details Tab */}
            {activeTab === 'details' && (
              <div>
                <div className="flex items-start justify-between mb-6 gap-8">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết Hụi</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Tên Hụi</label>
                        {isEditing ? (
                          <input type="text" defaultValue={huiData.name} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <p className="mt-1 text-gray-800 font-medium">{huiData.name}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Mô tả</label>
                        {isEditing ? (
                          <textarea defaultValue={huiData.description} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                        ) : (
                          <p className="mt-1 text-gray-800">{huiData.description}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Chủ Hụi</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.owner}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ngày bắt đầu</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.startDate}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Ngày kết thúc</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.endDate}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Số tiền mỗi kỳ</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.amount}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Chu kỳ</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.frequency}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Số thành viên</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.members}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-600">Số kỳ</label>
                        <p className="mt-1 text-gray-800 font-medium">{huiData.totalPeriods}</p>
                      </div>
                    </div>

                    {isEditing && (
                      <div className="flex justify-start pt-4 mt-4 border-t border-gray-200">
                        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                          Lưu thay đổi
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-shrink-0 flex flex-col gap-3">
                    <button 
                      onClick={() => setIsEditing(!isEditing)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                    >
                      <Edit className="w-4 h-4" />
                      <span className="text-sm font-medium">{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm font-medium">Quản lý quyền</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Danh sách thành viên ({members.length})</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    <UserPlus className="w-4 h-4" />
                    <span className="text-sm font-medium">Thêm thành viên</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {members.map(member => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{member.name}</p>
                          <p className="text-sm text-gray-500">{member.role}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {member.hasReceived && (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                            Đã hốt
                          </span>
                        )}
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          member.status === 'active' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {member.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Payment Schedule Tab */}
            {activeTab === 'schedule' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Lịch thanh toán tổng quan</h3>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Download className="w-4 h-4" />
                    <span className="text-sm font-medium">Export</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kỳ</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ngày đến hạn</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thành viên hốt hụi</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thăm kêu</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thảo</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tiền hốt</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Hành động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {paymentSchedule.map(payment => (
                        <tr key={payment.period} className="hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-800">{payment.period}</td>
                          <td className="px-4 py-3 text-gray-600">{payment.date}</td>
                          <td className="px-4 py-3 text-gray-800">{payment.recipient}</td>
                          <td className="px-4 py-3 text-gray-600">{payment.thamKeu}</td>
                          <td className="px-4 py-3 text-gray-600">{payment.thao}</td>
                          <td className="px-4 py-3 font-semibold text-gray-800">{payment.amount}</td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              payment.status === 'completed' 
                                ? 'bg-green-100 text-green-700' 
                                : payment.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}>
                              {payment.status === 'completed' ? 'Hoàn thành' : payment.status === 'pending' ? 'Đang chờ' : 'Sắp tới'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button className="text-red-600 hover:text-red-700 text-sm font-medium">
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Detailed Schedule Tab */}
            {activeTab === 'detailed' && (
              <div className="flex gap-6">
                {/* Period Navigation */}
                <div className="w-48 flex-shrink-0">
                  <h3 className="text-sm font-bold text-gray-800 mb-3">Chọn kỳ</h3>
                  <div className="space-y-2">
                    {paymentSchedule.map(p => (
                      <button
                        key={p.period}
                        onClick={() => setSelectedPeriod(p.period)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedPeriod === p.period
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Kỳ {p.period}</span>
                          {p.status === 'completed' && (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          )}
                        </div>
                        <span className="text-xs opacity-75">{p.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Period Details */}
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-gray-800">Chi tiết Kỳ {selectedPeriod}</h3>
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-medium">Export</span>
                    </button>
                  </div>

                  {/* Period Summary */}
                  <div className="grid grid-cols-4 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Người hốt</p>
                      <p className="font-bold text-gray-800">Nguyễn Văn A</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Thăm kêu</p>
                      <p className="font-bold text-gray-800">500k</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-xs text-gray-500 mb-1">Thảo</p>
                      <p className="font-bold text-gray-800">100k</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                      <p className="text-xs text-red-600 mb-1">Tổng tiền hốt</p>
                      <p className="font-bold text-red-700">9,4tr</p>
                    </div>
                  </div>

                  {/* Member Payments */}
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Thành viên</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Số tiền đóng</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Loại hụi</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {detailedPayments.map((payment, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium text-gray-800">{payment.member}</td>
                            <td className="px-4 py-3 font-semibold text-gray-800">{payment.amount}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                payment.status === 'hụi chết'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {payment.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {payment.paid ? (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="w-4 h-4" />
                                  <span className="text-sm font-medium">Đã thanh toán</span>
                                </span>
                              ) : (
                                <span className="flex items-center gap-1 text-orange-600">
                                  <Clock className="w-4 h-4" />
                                  <span className="text-sm font-medium">Chưa thanh toán</span>
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modals */}
      {/* Hot Hui Modal */}
      {showHotModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Hốt Hụi</h2>
                <button onClick={() => setShowHotModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ hốt</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Kỳ 5 - 01/05/2025</option>
                  <option>Kỳ 6 - 01/06/2025</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thành viên hốt</label>
                <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option>Chọn thành viên</option>
                  {members.map(m => (
                    <option key={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thăm kêu</label>
                  <input 
                    type="text" 
                    placeholder="0" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thảo</label>
                  <input 
                    type="text" 
                    placeholder="0" 
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Số tiền gốc:</span>
                  <span className="font-medium">10tr</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Trừ thăm kêu:</span>
                  <span className="font-medium text-red-600">-500k</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Trừ thảo:</span>
                  <span className="font-medium text-red-600">-100k</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-800">Tiền nhận:</span>
                    <span className="text-2xl font-bold text-green-600">9,4tr</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowHotModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Hủy
              </button>
              <button 
                onClick={() => {
                  setShowHotModal(false);
                  setShowInvoiceModal(true);
                }}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Xem trước hóa đơn
              </button>
              <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                Hốt không hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Hóa đơn Hụi</h2>
                <button onClick={() => setShowInvoiceModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-8 bg-white">
              {/* Invoice Header */}
              <div className="text-center mb-8 pb-6 border-b-2 border-gray-200">
                <h1 className="text-3xl font-bold text-red-600 mb-2">HÓA ĐƠN HỤI</h1>
                <p className="text-gray-600">Hụi Gia Đình</p>
                <p className="text-sm text-gray-500">Kỳ 5 - Ngày 01/05/2025</p>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Chủ hụi</p>
                  <p className="font-bold text-gray-800">Nguyễn Văn A</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Người hốt</p>
                  <p className="font-bold text-gray-800">Hoàng Văn E</p>
                </div>
              </div>

              {/* Payment Table */}
              <table className="w-full mb-8">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Thành viên</th>
                    <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Số tiền đóng</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Loại</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {detailedPayments.map((p, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 text-gray-800">{p.member}</td>
                      <td className="px-4 py-3 text-right font-medium text-gray-800">{p.amount}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded ${
                          p.status === 'hụi chết' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Summary */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng tiền gốc:</span>
                    <span className="font-semibold">120tr</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thăm kêu:</span>
                    <span className="font-semibold text-red-600">-500k</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thảo:</span>
                    <span className="font-semibold text-red-600">-100k</span>
                  </div>
                  <div className="border-t-2 border-gray-300 pt-3 flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Tiền nhận:</span>
                    <span className="text-2xl font-bold text-green-600">9,4tr</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-gray-500">
                <p>Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button 
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                Đóng
              </button>
              <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                Tải xuống PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">QR Chuyển khoản</h2>
                <button onClick={() => setShowQRModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-6">
                <div className="w-64 h-64 bg-white mx-auto flex items-center justify-center rounded-lg border-2 border-gray-300">
                  <QrCode className="w-32 h-32 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3 text-left">
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Ngân hàng:</span>
                  <span className="font-medium">Vietcombank</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Tên tài khoản:</span>
                  <span className="font-medium">Nguyễn Văn A</span>
                </div>
                <div className="flex justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm text-gray-600">Số tài khoản:</span>
                  <span className="font-medium">1234567890</span>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200">
              <button 
                onClick={() => setShowQRModal(false)}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full">
            <div className="p-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Xóa Hụi</h2>
              <p className="text-gray-600 text-center mb-6">
                Bạn có chắc chắn muốn xóa hụi này? Hành động này không thể hoàn tác.
              </p>

              <div className="flex gap-3">
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Hủy
                </button>
                <button className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                  Xóa
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Chat Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40">
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );
}