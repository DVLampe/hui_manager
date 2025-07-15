'use client'
import { useEffect, useState, useMemo, useRef } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter } from 'next/navigation'
import { fetchHuiById, updateHui, deleteHui, deleteHuiMember, resetDeleteMemberStatus, resetDeleteHuiStatus } from '@/store/huiSlice' 
import Layout from '@/components/shared/Layout'
import Button from '@/components/ui/Button'
import MemberList from '@/components/members/MemberList'
import PaymentList from '@/components/payments/PaymentList'
import PaymentScheduleTable from '@/components/payments/PaymentScheduleTable'
import DetailedPaymentScheduleTable from '@/components/payments/DetailedPaymentScheduleTable'
import Link from 'next/link'
import Input from '@/components/ui/Input' 
import Select from '@/components/ui/Select'
import { Modal } from '@/components/ui/Modal'
import { Toaster, useToast } from '@/components/ui/Toaster' 

export default function HuiDetailPage({ params }) {
  const dispatch = useDispatch()
  const router = useRouter()
  const { showToast } = useToast() 
  const {
    currentHui,
    fetchHuiByIdLoading,
    fetchHuiByIdError,
    updateHuiLoading,
    updateHuiError,
    deleteMemberLoading, 
    deleteMemberError,
    deleteHuiLoading,
    deleteHuiError,
    deleteHuiSuccess,
  } = useSelector((state) => state.hui)

  const [activeTab, setActiveTab] = useState('info')
  const [isSaving, setIsSaving] = useState(false);
  const [isHotHuiModalOpen, setIsHotHuiModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const FIXED_CURRENT_DATE = "2024-06-25"; 

  const [hotHuiKy, setHotHuiKy] = useState('');
  const [hotHuiMemberId, setHotHuiMemberId] = useState('');
  const [hotHuiThamKeu, setHotHuiThamKeu] = useState('');
  const [hotHuiThao, setHotHuiThao] = useState('');

  const scheduleGeneratedRef = useRef(false);

  const addMonths = (date, months) => {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
  };

  useEffect(() => {
    if (params.id) {
      dispatch(fetchHuiById(params.id))
    }
  }, [dispatch, params.id])

  useEffect(() => {
    if (scheduleGeneratedRef.current || fetchHuiByIdLoading || !currentHui) {
        return;
    }
    
    if (currentHui.totalMembers > 0 && currentHui.startDate && (!currentHui.payments || currentHui.payments.length === 0)) {
        scheduleGeneratedRef.current = true;
        
        const numberOfPeriods = currentHui.totalMembers;
        const initialStartDate = new Date(currentHui.startDate);
        const cycleDurationMonths = currentHui.cycle || 1;
        const today = new Date(FIXED_CURRENT_DATE);
        today.setHours(0, 0, 0, 0);

        const generatedPayments = [];
        for (let i = 0; i < numberOfPeriods; i++) {
            const dueDate = addMonths(new Date(initialStartDate), i * cycleDurationMonths);
            dueDate.setHours(0,0,0,0);
            
            const isFirstPeriod = i === 0;
            let status = 'CHUA_DEN_KY';
            if (isFirstPeriod || dueDate <= today) {
                status = 'CHO_THANH_TOAN';
            }

            generatedPayments.push({
              period: i + 1,
              dueDate: dueDate.toISOString(), 
              amount: currentHui.amount,
              status: status,
            });
        }

        const huiDataToUpdate = { ...currentHui, id: currentHui.id, payments: generatedPayments };
        const { manager, members, ...payload } = huiDataToUpdate;
        
        dispatch(updateHui(payload)).unwrap()
            .then(() => showToast({ message: "Lịch thanh toán đã được tạo tự động.", type: 'success' }))
            .catch(err => {
                showToast({ message: `Lỗi tạo lịch thanh toán tự động: ${err.message}`, type: 'error' });
                scheduleGeneratedRef.current = false;
            });
    }
  }, [currentHui, fetchHuiByIdLoading, dispatch, showToast]);

  useEffect(() => {
    if (deleteMemberError) {
      showToast({ message: `Lỗi xóa thành viên: ${deleteMemberError}`, type: 'error' });
      dispatch(resetDeleteMemberStatus());
    }
    if (deleteHuiError) {
      showToast({ message: `Lỗi xóa hụi: ${deleteHuiError}`, type: 'error' });
      dispatch(resetDeleteHuiStatus());
    }
    if (deleteHuiSuccess) {
      showToast({ message: "Hụi đã được xóa thành công!", type: 'success' });
      router.push('/hui');
      dispatch(resetDeleteHuiStatus());
    }
  }, [deleteMemberError, deleteHuiError, deleteHuiSuccess, dispatch, showToast, router]);

  const handleDeleteHui = () => {
    dispatch(deleteHui(params.id));
  };

  const selectedHui = currentHui;
  
  const memberOptions = useMemo(() => {
    if (!selectedHui?.members) return [];
    
    const paidMemberIds = new Set(
      selectedHui.payments
        .filter(p => p.potTakerMemberId !== null)
        .map(p => p.potTakerMemberId)
    );
    
    return selectedHui.members
      .filter(member => !paidMemberIds.has(member.id))
      .map(member => ({
        value: member.id,
        label: member.user.name 
      }));
  }, [selectedHui]);
  
  const availableKyOptions = useMemo(() => {
    if (!selectedHui?.payments) return [];
    return selectedHui.payments
      .filter(payment => payment.potTakerMemberId === null && payment.transactionStatus !== 'DA_THANH_TOAN' && payment.transactionStatus !== 'HUY') 
      .sort((a, b) => a.period - b.period) 
      .map(payment => ({
        value: String(payment.period), 
        label: `Kỳ ${payment.period}`
      }));
  }, [selectedHui]);

  useEffect(() => {
    if (isHotHuiModalOpen && selectedHui?.payments && availableKyOptions.length > 0) {
      let defaultSelectedKy = '';
      const paidPeriodsNumbers = selectedHui.payments
        .filter(p => p.transactionStatus === 'DA_THANH_TOAN')
        .map(p => p.period);
      let maxPaidPeriod = 0;
      if (paidPeriodsNumbers.length > 0) {
        maxPaidPeriod = Math.max(...paidPeriodsNumbers);
      }
      const nextAvailableKyOption = availableKyOptions.find(option => parseInt(option.value, 10) > maxPaidPeriod);
      if (nextAvailableKyOption) {
        defaultSelectedKy = nextAvailableKyOption.value;
      } else if (availableKyOptions.length > 0) {
        defaultSelectedKy = availableKyOptions[0].value;
      }
      setHotHuiKy(defaultSelectedKy);
    }
  }, [isHotHuiModalOpen, availableKyOptions, selectedHui?.payments]);

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
      const parseLocaleNumber = (str) => {
        if (typeof str !== 'string' || !str.trim()) return null;
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      };
      return {
        period: parseInt(item.period, 10),
        dueDate: item.dueDate, 
        amount: parseLocaleNumber(String(item.amountDisplay)),
        memberId: item.thanhVienHotHui || null, 
        userId: paymentUserId, 
        amountCollected: parseLocaleNumber(String(item.tienHot)),
        status: item.status, 
        thamKeu: parseLocaleNumber(String(item.thamKeu)),
        thao: parseLocaleNumber(String(item.thao))
      };
    });

    const huiDataToUpdate = { ...currentHui, id: currentHui.id, payments: updatedPaymentsPayload };
    const { manager, members, ...payload } = huiDataToUpdate;

    try {
      await dispatch(updateHui(payload)).unwrap();
      showToast({ message: "Lịch thanh toán đã được cập nhật thành công!", type: 'success' });
      dispatch(fetchHuiById(params.id)); 
    } catch (err) {
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
    } catch (err) {
       // Error is already handled by the useEffect hook
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
    const periodNumber = parseInt(hotHuiKy, 10);
    const paymentToUpdate = currentHui?.payments?.find(p => p.period === periodNumber);

    if (!paymentToUpdate) {
        showToast({ message: 'Lỗi: Không tìm thấy kỳ hốt đã chọn.', type: 'error' });
        return;
    }
    if (!hotHuiMemberId) {
        showToast({ message: 'Vui lòng chọn thành viên hốt hụi.', type: 'error' });
        return;
    }

    const baseAmountForPeriod = parseFloat(paymentToUpdate.amount || currentHui.amount);
    const thamKeuAmount = parseFloat(hotHuiThamKeu) || 0;

    const membersWhoTookPotBeforeThisPeriod = new Set();
    currentHui.payments.forEach(p => {
        if (p.period < periodNumber && (p.status === 'DA_THANH_TOAN' || p.transactionStatus === 'DA_THANH_TOAN') && p.potTakerMemberId) {
            membersWhoTookPotBeforeThisPeriod.add(p.potTakerMemberId);
        }
    });

    const memberContributions = currentHui.members.map(member => {
        const isPotTakerThisPeriod = member.id === hotHuiMemberId;
        const hasTakenPotPreviously = membersWhoTookPotBeforeThisPeriod.has(member.id);
        
        let amountContributed = 0;
        let contributionStatus = 'CHUA_DONG'; 

        if (isPotTakerThisPeriod) {
            amountContributed = 0;
            contributionStatus = 'MIEN_DONG'; 
        } else if (hasTakenPotPreviously) {
            amountContributed = baseAmountForPeriod;
            contributionStatus = 'DA_DONG';
        } else {
            amountContributed = baseAmountForPeriod - thamKeuAmount;
            contributionStatus = 'DA_DONG';
        }

        return {
            memberId: member.id,
            amountContributed: amountContributed,
            status: contributionStatus,
            paymentId: paymentToUpdate.id,
        };
    });

    const updatedPayment = {
        ...paymentToUpdate,
        potTakerMemberId: hotHuiMemberId, 
        thamKeu: thamKeuAmount,
        thao: parseFloat(hotHuiThao) || 0,
        amountCollected: currentHui.amount * (currentHui.members.length - 1) - thamKeuAmount,
        transactionStatus: 'DA_THANH_TOAN',
        status: 'DA_THANH_TOAN',
        memberContributions: memberContributions,
    };
    
    let nextPeriodSet = false;
    const updatedPayments = currentHui.payments.map(p => {
        if (p.id === updatedPayment.id) {
            return updatedPayment;
        }
        if (p.period > periodNumber && !p.potTakerMemberId && !nextPeriodSet) {
             if (p.transactionStatus !== 'DA_THANH_TOAN' && p.status !== 'DA_THANH_TOAN') {
                p.status = 'CHO_THANH_TOAN';
                p.transactionStatus = 'CHO_THANH_TOAN';
                nextPeriodSet = true;
            }
        }
        return p;
    });
    
    const huiDataToUpdate = {
        ...currentHui,
        id: currentHui.id,
        payments: updatedPayments,
    };

    const { manager, members, ...payload } = huiDataToUpdate;

    setIsSaving(true);
    dispatch(updateHui(payload)).unwrap()
        .then(() => {
            showToast({ message: `Kỳ ${hotHuiKy} đã được hốt thành công!`, type: 'success' });
            dispatch(fetchHuiById(params.id));
            handleCloseHotHuiModal();
        })
        .catch(err => showToast({ message: `Lỗi Hốt Hụi: ${err.message || 'Vui lòng thử lại.'}`, type: 'error' }))
        .finally(() => setIsSaving(false));
  };


  const isLoading = fetchHuiByIdLoading || isSaving || deleteMemberLoading || deleteHuiLoading;

  if (fetchHuiByIdLoading) {
    return <Layout><Toaster /><div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div></div></Layout>;
  }

  if (fetchHuiByIdError && !currentHui) {
    return <Layout><Toaster /><div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 my-4"><p>Lỗi: {fetchHuiByIdError}</p></div></Layout>;
  }

  if (!currentHui) {
    return <Layout><Toaster /><div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-md p-4 my-4"><p>Không tìm thấy thông tin hụi. (ID: {params.id})</p></div></Layout>;
  }

  const completedPayments = selectedHui?.payments?.filter(p => p && (p.status === 'DA_THANH_TOAN' || p.transactionStatus === 'DA_THANH_TOAN')).length || 0;
  const totalRounds = selectedHui?.totalMembers || 0;
  const progressPercentage = totalRounds > 0 ? (completedPayments / totalRounds) * 100 : 0;

  const tabItems = [
    { id: 'info', label: 'Thông tin chi tiết' },
    { id: 'members', label: 'Danh sách thành viên' },
    { id: 'schedules', label: 'Lịch thanh toán' },
    { id: 'detailed_schedules', label: 'Lịch thanh toán chi tiết' },
    { id: 'payments', label: 'Lịch sử giao dịch' },
  ];

  return (
    <Layout>
      <Toaster />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{selectedHui?.name}</h1>
          <div className="flex space-x-3">
            <Link href={`/hui/${params.id}/edit`}>
              <Button variant="outline" className="flex items-center" disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                Chỉnh sửa hụi
              </Button>
            </Link>
            <Button variant="danger" className="flex items-center" onClick={() => setIsDeleteModalOpen(true)} disabled={isLoading}>
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
          <Button 
            variant="primary" 
            onClick={handleOpenHotHuiModal} 
            disabled={isLoading || selectedHui?.status !== 'ACTIVE' || availableKyOptions.length === 0}
          >
            Hốt Hụi
          </Button>
        </div>

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
                    <dt className="text-sm font-medium text-gray-500">Người quản lý</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedHui?.manager?.name || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc (dự kiến)</dt>
                    <dd className="mt-1 text-sm text-gray-900">{selectedHui?.endDate ? new Date(selectedHui.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedHui?.description || 'Không có mô tả'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Luật chơi</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{selectedHui?.rules || 'Không có luật chơi cụ thể'}</dd>
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
                    <Button variant="primary" size="sm" disabled={isLoading}>Thêm thành viên</Button>
                </Link>
              </div>
              <MemberList members={selectedHui?.members || []} huiId={selectedHui?.id} onDeleteMember={handleDeleteMember} disabled={isLoading} />
            </div>
          )}

          {activeTab === 'schedules' && (
            <div>
              {selectedHui ? (
                <PaymentScheduleTable huiGroup={selectedHui} currentDateString={FIXED_CURRENT_DATE} onSaveChanges={handleSavePaymentScheduleChanges} disabled={isLoading} />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán.</p>
              )}
            </div>
          )}

          {activeTab === 'detailed_schedules' && (
            <div>
              {selectedHui ? (
                <DetailedPaymentScheduleTable huiGroup={selectedHui} currentDateString={FIXED_CURRENT_DATE} />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán chi tiết.</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
             <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch ({selectedHui?.payments?.length || 0})</h2>
                <Link href={`/payments/create?huiId=${selectedHui?.id}&amount=${selectedHui?.amount}`}>
                    <Button variant="primary" size="sm" disabled={isLoading}>Thêm giao dịch</Button>
                </Link>
              </div>
              <PaymentList payments={selectedHui?.payments || []} members={selectedHui?.members || []} />
            </div>
          )}
        </div>
      </div>
      
      <Modal 
        isOpen={isDeleteModalOpen} 
        onClose={() => setIsDeleteModalOpen(false)} 
        title="Xác nhận xóa"
        footer={
          <div className="flex justify-end space-x-3">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={deleteHuiLoading}>Hủy</Button>
            <Button variant="danger" onClick={handleDeleteHui} disabled={deleteHuiLoading}>
              {deleteHuiLoading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        }
      >
        <p>Bạn có chắc chắn muốn xóa hụi "{selectedHui?.name}" không? Hành động này không thể hoàn tác.</p>
      </Modal>

      {isHotHuiModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Hốt Hụi</h2>
            <form onSubmit={(e) => { e.preventDefault(); handleHotHuiSubmitInternal(); }}>
              <div className="mb-4">
                <label htmlFor="hotHuiKy" className="block text-sm font-medium text-gray-700 mb-1">Kỳ hốt</label>
                <Select 
                  id="hotHuiKy"
                  value={hotHuiKy}
                  onChange={(e) => setHotHuiKy(e.target.value)}
                  options={[{ value: '', label: 'Chọn kỳ hốt' }, ...availableKyOptions]}
                  className="w-full"
                  disabled={availableKyOptions.length === 0}
                />
                {availableKyOptions.length === 0 && <p className="text-xs text-red-500 mt-1">Không có kỳ nào hợp lệ để hốt.</p>}
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
                  placeholder="Nhập số tiền thẩm kêu (nếu có)" 
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="hotHuiThao" className="block text-sm font-medium text-gray-700 mb-1">Thảo (tiền lời cho chủ hụi)</label>
                <Input 
                  type="number" 
                  id="hotHuiThao" 
                  value={hotHuiThao} 
                  onChange={(e) => setHotHuiThao(e.target.value)} 
                  placeholder="Nhập số tiền thảo (nếu có)" 
                  className="w-full"
                  min="0"
                />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="secondary" onClick={handleCloseHotHuiModal} disabled={isSaving}>Hủy</Button>
                <Button type="submit" variant="primary" disabled={isSaving || !hotHuiKy || !hotHuiMemberId}>Xác nhận Hốt</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  )
}
