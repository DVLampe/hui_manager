'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHuiById, updateHui, deleteHuiMember, resetDeleteMemberStatus } from '@/store/huiSlice' 
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import MemberList from '@/components/members/MemberList'
import PaymentList from '@/components/payments/PaymentList'
import PaymentScheduleTable from '@/components/payments/PaymentScheduleTable'
import DetailedPaymentScheduleTable from '@/components/payments/DetailedPaymentScheduleTable' // Import the new component
import Link from 'next/link'
import Input from '@/components/ui/Input' 
import Select from '@/components/ui/Select'
import { Toaster, useToast } from '@/components/ui/Toaster' 

export default function HuiDetailPage({ params }) {
  const dispatch = useDispatch()
  const { showToast } = useToast() 
  const {
    currentHui,
    fetchHuiByIdLoading,
    fetchHuiByIdError,
    updateHuiLoading,
    updateHuiError,
    deleteMemberLoading, 
    deleteMemberError    
  } = useSelector((state) => state.hui)

  const [activeTab, setActiveTab] = useState('info')
  const [isSaving, setIsSaving] = useState(false);
  const [isHotHuiModalOpen, setIsHotHuiModalOpen] = useState(false);
  const FIXED_CURRENT_DATE = "2024-06-25"; // This should ideally come from a configurable source or global state

  const [hotHuiKy, setHotHuiKy] = useState('');
  const [hotHuiMemberId, setHotHuiMemberId] = useState('');
  const [hotHuiThamKeu, setHotHuiThamKeu] = useState('');
  const [hotHuiThao, setHotHuiThao] = useState('');

  useEffect(() => {
    if (params.id) {
      dispatch(fetchHuiById(params.id))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (deleteMemberError) {
      showToast({ message: `Lỗi xóa thành viên: ${deleteMemberError}`, type: 'error' });
      dispatch(resetDeleteMemberStatus());
    }
  }, [deleteMemberError, dispatch, showToast]);

  const handleSavePaymentScheduleChanges = async (updatedScheduleFromTable) => {
    if (!currentHui || !currentHui.members) {
      showToast({ message: "Lỗi: Không tìm thấy thông tin hụi hoặc danh sách thành viên.", type: 'error' });
      setIsSaving(false);
      return;
    }
    setIsSaving(true);

    const updatedPaymentsPayload = updatedScheduleFromTable.map(item => {
      let paymentUserId = null;
      if (item.thanhVienHotHui) {
        const member = currentHui.members.find(m => m.id === item.thanhVienHotHui);
        if (member && member.userId) {
          paymentUserId = member.userId;
        } else {
          console.warn(`Could not find userId for thanhVienHotHui (HuiMember.id): ${item.thanhVienHotHui}`);
        }
      }
      // Helper to parse localized string to number
      const parseLocaleNumber = (str) => {
        if (typeof str !== 'string' || !str.trim()) return null;
        // Remove dots (thousands separators) and then replace comma (decimal) with dot
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      };

      return {
        period: parseInt(item.period, 10),
        dueDate: item.dueDate, // Date should be in YYYY-MM-DD or parsable format if not already
        amount: parseLocaleNumber(String(item.amountDisplay)),
        memberId: item.thanhVienHotHui || null,
        userId: paymentUserId,
        amountCollected: parseLocaleNumber(String(item.tienHot)),
        status: item.status, // This is payment status
        thamKeu: parseLocaleNumber(String(item.thamKeu)),
        thao: parseLocaleNumber(String(item.thao))
      };
    });

    const huiDataToUpdate = {
      ...currentHui,
      id: currentHui.id,
      payments: updatedPaymentsPayload,
    };
    const { manager, members, ...payload } = huiDataToUpdate;

    try {
      await dispatch(updateHui(payload)).unwrap();
      showToast({ message: "Lịch thanh toán đã được cập nhật thành công!", type: 'success' });
      dispatch(fetchHuiById(params.id)); 
    } catch (err) {
      console.error('Failed to update hui:', err);
      showToast({ message: `Lỗi cập nhật lịch thanh toán: ${err.message || 'Vui lòng thử lại.'}`, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (memberId) => {
    if (!memberId) {
      showToast({ message: "Lỗi: Không có ID thành viên để xóa.", type: 'error' });
      return;
    }
    try {
      await dispatch(deleteHuiMember(memberId)).unwrap();
      showToast({ message: "Thành viên đã được xóa thành công!", type: 'success' });
      // No need to manually refetch hui if the store is updated correctly by the slice
      // However, if there are local state dependencies that need hui re-fetch, uncomment:
      // dispatch(fetchHuiById(params.id)); 
    } catch (err) {
      console.error('Failed to delete member from page:', err); 
      // Error toast is handled by useEffect on deleteMemberError
    }
  };

  const resetHotHuiForm = () => {
    setHotHuiKy('');
    setHotHuiMemberId('');
    setHotHuiThamKeu('');
    setHotHuiThao('');
  };
  const handleOpenHotHuiModal = () => { resetHotHuiForm(); setIsHotHuiModalOpen(true); };
  const handleCloseHotHuiModal = () => { setIsHotHuiModalOpen(false); resetHotHuiForm(); };
  const handleHotHuiSubmitInternal = () => {
    // This is where you would dispatch an action to update the payment with hốt hụi details
    // For example, finding the payment for hotHuiKy, updating its memberId, thamKeu, thao, amountCollected, status
    // Then calling handleSavePaymentScheduleChanges or a similar update function.
    console.log("Hot Hui form submitted", { hotHuiKy, hotHuiMemberId, hotHuiThamKeu, hotHuiThao });
    // Placeholder: show a toast and close
    showToast({ message: 'Chức năng Hốt Hụi đang được phát triển.', type: 'info' });
    handleCloseHotHuiModal();
  };

  let status;
  if (fetchHuiByIdLoading || isSaving || deleteMemberLoading) { 
    status = 'loading';
  } else if (fetchHuiByIdError || updateHuiError) { 
    status = 'failed';
  } else if (currentHui) {
    status = 'succeeded';
  } else {
    status = 'idle_or_not_found'; // Represents a state where no hui is loaded, not necessarily an error yet.
  }

  if (status === 'loading') {
    return <Layout>
      <Toaster />
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        {(isSaving || deleteMemberLoading) && <p className="ml-4 text-indigo-600">Đang xử lý...</p>}
      </div>
    </Layout>
  }

  if (status === 'failed') {
    return <Layout>
      <Toaster />
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4">
        <div className="flex">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>Lỗi: {fetchHuiByIdError || updateHuiError?.message || updateHuiError || 'Không thể tải hoặc cập nhật chi tiết hụi.'}</p>
        </div>
      </div>
    </Layout>
  }

  if (!currentHui && status !== 'loading' && status !== 'failed') {
    return <Layout>
      <Toaster />
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 my-4">
            <p>Không tìm thấy thông tin hụi. (ID: {params.id})</p>
        </div>
    </Layout>
  }

  const selectedHui = currentHui;
  const completedPayments = selectedHui?.payments?.filter(p => p && (p.status === 'DA_THANH_TOAN' || p.transactionStatus === 'DA_THANH_TOAN')).length || 0;
  const totalRounds = selectedHui?.totalMembers || 0;
  const progressPercentage = totalRounds > 0 ? (completedPayments / totalRounds) * 100 : 0;
  const memberOptions = currentHui?.members?.map(member => ({ 
    value: member.id, 
    label: member.user?.name || member.name || `Member ID: ${member.id}` 
  })) || [];

  const tabItems = [
    { id: 'info', label: 'Thông tin chi tiết' },
    { id: 'members', label: 'Danh sách thành viên' },
    { id: 'schedules', label: 'Lịch thanh toán' },
    { id: 'detailed_schedules', label: 'Lịch thanh toán chi tiết' }, // New tab added
    { id: 'payments', label: 'Lịch sử giao dịch' },
  ];

  return (
    <Layout>
      <Toaster />
      <div className="space-y-6">
        {/* Header and Hui Stats - unchanged */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{selectedHui?.name}</h1>
          <div className="flex space-x-3">
            <Link href={`/hui/${params.id}/edit`}>
              <Button variant="outline" className="flex items-center" disabled={isSaving || deleteMemberLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Chỉnh sửa hụi
              </Button>
            </Link>
            <Button variant="danger" className="flex items-center" onClick={() => showToast({ message: 'Chức năng xóa hụi chưa được cài đặt', type: 'info'})} disabled={isSaving || deleteMemberLoading}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              Xóa hụi
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-500 mb-1">Số tiền mỗi kỳ</p><p className="text-xl font-bold text-gray-800">{selectedHui?.amount?.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                <p className="text-sm text-gray-500 mb-1">Số thành viên</p><p className="text-xl font-bold text-gray-800">{selectedHui?.members?.length || 0}/{selectedHui?.totalMembers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500 mb-1">Chu kỳ</p><p className="text-xl font-bold text-gray-800">{selectedHui?.cycle || 1} tháng</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 mb-1">Trạng thái hụi</p><p className="text-xl font-bold text-gray-800">{selectedHui?.status}</p>
            </div>
        </div>
        <div className="bg-white rounded-lg shadow p-5">
          <div className="flex justify-between mb-2"><p>Tiến độ</p><p>{completedPayments}/{totalRounds} kỳ</p></div>
          <div className="w-full bg-gray-200 rounded-full h-2.5"><div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div></div>
        </div>

        <div className="mt-4 flex justify-center"> 
          <Button variant="primary" onClick={handleOpenHotHuiModal} disabled={isSaving || deleteMemberLoading || selectedHui?.status !== 'ACTIVE'}>Hốt Hụi</Button>
        </div>

        {/* Tabs - unchanged structure, new item added to tabItems */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
            {tabItems.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'info' && (
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Thông tin chi tiết Hụi</h3>
                <dl className="mt-5 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Tên Hụi</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedHui?.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(selectedHui?.startDate).toLocaleDateString('vi-VN')}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ghi chú</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedHui?.note || 'Không có ghi chú'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Danh sách thành viên ({selectedHui?.members?.length || 0})</h2>
                <Link href={`/members/create?huiId=${selectedHui?.id}`}>
                    <Button variant="primary" size="sm" disabled={isSaving || deleteMemberLoading}>
                        Thêm thành viên
                    </Button>
                </Link>
              </div>
              <MemberList 
                members={selectedHui?.members || []} 
                huiId={selectedHui?.id} 
                onDeleteMember={handleDeleteMember} 
                disabled={isSaving || deleteMemberLoading} 
              />
            </div>
          )}

          {activeTab === 'schedules' && (
            <div>
              {selectedHui ? (
                <PaymentScheduleTable
                  huiGroup={selectedHui}
                  currentDateString={FIXED_CURRENT_DATE}
                  onSaveChanges={handleSavePaymentScheduleChanges}
                  disabled={isSaving || deleteMemberLoading} 
                />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán.</p>
              )}
            </div>
          )}

          {/* Render DetailedPaymentScheduleTable for the new tab */}
          {activeTab === 'detailed_schedules' && (
            <div>
              {selectedHui ? (
                <DetailedPaymentScheduleTable
                  huiGroup={selectedHui}
                  currentDateString={FIXED_CURRENT_DATE}
                  // Add any other props DetailedPaymentScheduleTable might need in the future
                />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán chi tiết.</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
             <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch ({selectedHui?.payments?.length || 0})</h2>
                {/* Link to create payment might need adjustment based on how payments relate to schedule vs ad-hoc */}
                <Link href={`/payments/create?huiId=${selectedHui?.id}&amount=${selectedHui?.amount}`}>
                    <Button variant="primary" size="sm" disabled={isSaving || deleteMemberLoading}>
                        Thêm giao dịch
                    </Button>
                </Link>
              </div>
              <PaymentList payments={selectedHui?.payments || []} members={selectedHui?.members || []} />
            </div>
          )}
        </div>
      </div>
      
      {/* Hot Hui Modal - unchanged */}
      {isHotHuiModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Hốt Hụi</h2>
            <form>
              <p className="text-xs text-gray-500 mb-2">Debug: Member options count: {memberOptions.length}</p>
              <div className="mb-4">
                <label htmlFor="hotHuiKy" className="block text-sm font-medium text-gray-700 mb-1">Kỳ hốt</label>
                <Input 
                  type="text" 
                  id="hotHuiKy" 
                  value={hotHuiKy} 
                  onChange={(e) => setHotHuiKy(e.target.value)} 
                  placeholder="Nhập kỳ hốt" 
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="hotHuiMemberId" className="block text-sm font-medium text-gray-700 mb-1">Thành viên hốt</label>
                <Select
                  id="hotHuiMemberId"
                  value={hotHuiMemberId}
                  onChange={(e) => setHotHuiMemberId(e.target.value)}
                  options={[{ value: '', label: 'Chọn thành viên' }, ...memberOptions]}
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="hotHuiThamKeu" className="block text-sm font-medium text-gray-700 mb-1">Thăm kêu</label>
                <Input 
                  type="number" 
                  id="hotHuiThamKeu" 
                  value={hotHuiThamKeu} 
                  onChange={(e) => setHotHuiThamKeu(e.target.value)} 
                  placeholder="Nhập số tiền thẩm kêu" 
                  className="w-full"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="hotHuiThao" className="block text-sm font-medium text-gray-700 mb-1">Thảo</label>
                <Input 
                  type="number" 
                  id="hotHuiThao" 
                  value={hotHuiThao} 
                  onChange={(e) => setHotHuiThao(e.target.value)} 
                  placeholder="Nhập số tiền thảo" 
                  className="w-full"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="secondary" onClick={handleCloseHotHuiModal}>Hủy</Button>
                <Button type="button" variant="primary" onClick={handleHotHuiSubmitInternal}>Xác nhận</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
