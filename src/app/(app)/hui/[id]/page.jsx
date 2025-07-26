'use client'
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import MemberList from '@/components/members/MemberList';
import PaymentList from '@/components/payments/PaymentList';
import PaymentScheduleTable from '@/components/payments/PaymentScheduleTable';
import DetailedPaymentScheduleTable from '@/components/payments/DetailedPaymentScheduleTable';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Toaster, useToast } from '@/components/ui/Toaster';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';

function HuiDetailClient({ params, vietnamDateString }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [hui, setHui] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHotHuiModalOpen, setIsHotHuiModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hotHuiKy, setHotHuiKy] = useState('');
  const [hotHuiMemberId, setHotHuiMemberId] = useState('');
  const [hotHuiThamKeu, setHotHuiThamKeu] = useState('');
  const [hotHuiThao, setHotHuiThao] = useState('');

  const memberOptions = useMemo(() => {
    if (!hui?.members) return [];
    const paidMemberIds = new Set(
      hui.payments
        .filter(p => p.potTakerMemberId !== null)
        .map(p => p.potTakerMemberId)
    );
    return hui.members
      .filter(member => !paidMemberIds.has(member.id))
      .map(member => ({ value: member.id, label: member.user.name }));
  }, [hui]);

  const availableKyOptions = useMemo(() => {
    if (!hui?.payments) return [];
    return hui.payments
      .filter(payment => payment.potTakerMemberId === null && payment.transactionStatus !== 'DA_THANH_TOAN' && payment.transactionStatus !== 'HUY')
      .sort((a, b) => a.period - b.period)
      .map(payment => ({ value: String(payment.period), label: `Kỳ ${payment.period}` }));
  }, [hui]);

  useEffect(() => {
    const fetchHuiData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/hui/${params.id}`);
        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || `Hui not found`);
        }
        const data = await response.json();
        setHui(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (params.id) {
      fetchHuiData();
    }
  }, [params.id]);

  const fetchHuiData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hui/${params.id}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Hui not found (ID: ${params.id})`);
      }
      const data = await response.json();
      setHui(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHui = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hui/${params.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete Hui');
      }
      showToast({ message: "Hụi đã được xóa thành công!", type: 'success' });
      router.push('/hui');
    } catch (err) {
      setError(err.message);
      showToast({ message: `Lỗi xóa hụi: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
      setIsDeleteModalOpen(false);
    }
  };

  const handleUpdateHui = async (payload) => {
    try {
        setLoading(true);
        const response = await fetch(`/api/hui/${params.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to update Hui');
        }
        await fetchHuiData(); // Refetch data to show updates
        showToast({ message: "Cập nhật thành công!", type: 'success' });
    } catch (err) {
        setError(err.message);
        showToast({ message: `Lỗi cập nhật: ${err.message}`, type: 'error' });
    } finally {
        setLoading(false);
    }
  };

  const handleSavePaymentScheduleChanges = async (updatedScheduleFromTable) => {
    if (!hui || !hui.members) {
      showToast({ message: "Lỗi: Không tìm thấy thông tin hụi hoặc danh sách thành viên.", type: 'error' });
      return;
    }

    // This logic transforms the data from the table into the format our API expects.
    const updatedPaymentsPayload = updatedScheduleFromTable.map(item => {
      const parseLocaleNumber = (str) => {
        if (typeof str !== 'string' || !str.trim()) return null;
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      };
      return {
        period: parseInt(item.period, 10),
        dueDate: item.dueDate,
        amount: parseLocaleNumber(String(item.amountDisplay)),
        potTakerMemberId: item.thanhVienHotHui || null,
        amountCollected: parseLocaleNumber(String(item.tienHot)),
        status: item.status,
        thamKeu: parseLocaleNumber(String(item.thamKeu)),
        thao: parseLocaleNumber(String(item.thao)),
        // We ensure userId is present, defaulting to the manager
        userId: hui.managerId,
      };
    });

    const huiDataToUpdate = { ...hui, payments: updatedPaymentsPayload };

    // The handleUpdateHui function already sends the data and shows notifications.
    await handleUpdateHui(huiDataToUpdate);
  };

  const handleDeleteMember = async (memberId) => {
    if (!memberId) {
      showToast({ message: "Lỗi: Không có ID thành viên để xóa.", type: 'error' });
      return;
    }
    try {
      setLoading(true);
      const response = await fetch(`/api/members/${memberId}`, { method: 'DELETE' });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to delete member');
      }

      showToast({ message: "Thành viên đã được xóa thành công!", type: 'success' });
      await fetchHuiData(); // Refetch the main hui data to update the member list
    } catch (err) {
       showToast({ message: `Lỗi xóa thành viên: ${err.message}`, type: 'error' });
       // We still refetch data in case the list is out of sync
       await fetchHuiData();
    } finally {
        setLoading(false);
    }
  };

  const resetHotHuiForm = () => {
    setHotHuiKy('');
    setHotHuiMemberId('');
    setHotHuiThamKeu('');
    setHotHuiThao('');
  };

  const handleOpenHotHuiModal = () => {
    resetHotHuiForm();
    setIsHotHuiModalOpen(true);
  };

  const handleCloseHotHuiModal = () => {
    setIsHotHuiModalOpen(false);
    resetHotHuiForm();
  };

  const handleHotHuiSubmitInternal = () => {
    console.log("Submitting Hot Hui:", { hotHuiKy, hotHuiMemberId, hotHuiThamKeu, hotHuiThao });
    showToast({ message: "Chức năng Hốt Hụi đang được cập nhật.", type: 'info' });
    handleCloseHotHuiModal();
  };

  if (loading && !hui) {
    return <div className="flex justify-center items-center h-64"><Loading message="Đang tải thông tin hụi..." /></div>;
  }

  if (error) {
    return <Alert type="error" message={error} />;
  }

  if (!hui) {
    return <Alert type="warning" message={`Không tìm thấy thông tin hụi.`} />;
  }

  const completedPayments = hui?.payments?.filter(p => p && (p.status === 'DA_THANH_TOAN' || p.transactionStatus === 'DA_THANH_TOAN')).length || 0;
  const totalRounds = hui?.totalMembers || 0;
  const progressPercentage = totalRounds > 0 ? (completedPayments / totalRounds) * 100 : 0;
  const tabItems = [
    { id: 'info', label: 'Thông tin chi tiết' },
    { id: 'members', label: 'Danh sách thành viên' },
    { id: 'schedules', label: 'Lịch thanh toán' },
    { id: 'detailed_schedules', label: 'Lịch chi tiết' },
    { id: 'payments', label: 'Lịch sử giao dịch' }
  ];

  const FIXED_CURRENT_DATE = "2024-06-25";

  return (
    <>
      <Toaster />
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">{hui?.name}</h1>
          <div className="flex space-x-3">
            <Link href={`/hui/${params.id}/edit`}>
                  <Button variant="outline">Chỉnh sửa hụi</Button>
              </Link>
              <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)}>Xóa hụi</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-indigo-500">
                <p className="text-sm text-gray-500 mb-1">Số tiền mỗi kỳ</p><p className="text-xl font-bold text-gray-800">{hui?.amount?.toLocaleString('vi-VN')}đ</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                <p className="text-sm text-gray-500 mb-1">Số thành viên</p><p className="text-xl font-bold text-gray-800">{hui?.members?.length || 0}/{hui?.totalMembers || 0}</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-yellow-500">
                <p className="text-sm text-gray-500 mb-1">Chu kỳ</p><p className="text-xl font-bold text-gray-800">{hui?.cycle || 1} tháng</p>
            </div>
            <div className="bg-white rounded-lg shadow p-5 border-l-4 border-blue-500">
                <p className="text-sm text-gray-500 mb-1">Trạng thái hụi</p><p className="text-xl font-bold text-gray-800">{hui?.status}</p>
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
            disabled={loading || hui?.status !== 'ACTIVE' || availableKyOptions.length === 0}
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
                    <dd className="mt-1 text-sm text-gray-900">{hui?.name}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ngày bắt đầu</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(hui?.startDate).toLocaleDateString('vi-VN')}</dd>
                  </div>
                   <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Người quản lý</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hui?.manager?.name || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Ngày kết thúc (dự kiến)</dt>
                    <dd className="mt-1 text-sm text-gray-900">{hui?.endDate ? new Date(hui.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Mô tả</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{hui?.description || 'Không có mô tả'}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Luật chơi</dt>
                    <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">{hui?.rules || 'Không có luật chơi cụ thể'}</dd>
                  </div>
                </dl>
              </div>
        </div>
          )}

          {activeTab === 'members' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Danh sách thành viên ({hui?.members?.length || 0})</h2>
                <Link href={`/members/create?huiId=${hui?.id}`}>
                    <Button variant="primary" size="sm" disabled={loading}>Thêm thành viên</Button>
                </Link>
              </div>
              <MemberList members={hui?.members || []} huiId={hui?.id} onDeleteMember={handleDeleteMember} disabled={loading} />
            </div>
      )}

          {activeTab === 'schedules' && (
            <div>
              {hui ? (
                <PaymentScheduleTable huiGroup={hui} currentDateString={vietnamDateString} onSaveChanges={handleSavePaymentScheduleChanges} disabled={loading} />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán.</p>
              )}
            </div>
          )}

          {activeTab === 'detailed_schedules' && (
            <div>
              {hui ? (
                <DetailedPaymentScheduleTable huiGroup={hui} currentDateString={vietnamDateString} />
              ) : (
                <p>Chưa có thông tin hụi để hiển thị lịch thanh toán chi tiết.</p>
              )}
            </div>
          )}

          {activeTab === 'payments' && (
             <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Lịch sử giao dịch ({hui?.payments?.length || 0})</h2>
                <Link href={`/payments/create?huiId=${hui?.id}&amount=${hui?.amount}`}>
                    <Button variant="primary" size="sm" disabled={isLoading}>Thêm giao dịch</Button>
                </Link>
              </div>
              <PaymentList payments={hui?.payments || []} members={hui?.members || []} />
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
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} disabled={loading}>Hủy</Button>
            <Button variant="danger" onClick={handleDeleteHui} disabled={loading}>
              {loading ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
}
      >
        <p>Bạn có chắc chắn muốn xóa hụi "{hui?.name}" không? Hành động này không thể hoàn tác.</p>
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
                <Input type="number" id="hotHuiThamKeu" value={hotHuiThamKeu} onChange={(e) => setHotHuiThamKeu(e.target.value)} className="w-full" />
              </div>
              <div className="mb-4">
                <label htmlFor="hotHuiThao" className="block text-sm font-medium text-gray-700 mb-1">Thảo</label>
                <Input type="number" id="hotHuiThao" value={hotHuiThao} onChange={(e) => setHotHuiThao(e.target.value)} className="w-full" />
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <Button type="button" variant="secondary" onClick={handleCloseHotHuiModal} disabled={isSaving}>Hủy</Button>
                <Button type="submit" variant="primary" disabled={isSaving || !hotHuiKy || !hotHuiMemberId}>Xác nhận Hốt</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default async function HuiDetailPage({ params }) {
  const vietnamDateString = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  return <HuiDetailClient params={params} vietnamDateString={vietnamDateString} />;
}
