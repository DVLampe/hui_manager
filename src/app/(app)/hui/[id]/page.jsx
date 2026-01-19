'use client'
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/lib/hooks';
import Button from '@/components/ui/Button';
import MemberList from '@/components/members/MemberList';
import PaymentScheduleTable from '@/components/payments/PaymentScheduleTable';
import DetailedPaymentScheduleTable from '@/components/payments/DetailedPaymentScheduleTable';
import Link from 'next/link';
import Input from '@/components/ui/Input';
import NumberInput from '@/components/ui/NumberInput';
import Select from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Toaster, useToast } from '@/components/ui/Toaster';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import PermissionsModal from '@/components/hui/PermissionsModal';
import HuiInvoice from '@/components/hui/HuiInvoice';
import ChatModal from '@/components/chat/ChatModal';
import OwnerBankInfoModal from '@/components/hui/OwnerBankInfo-Modal';
import dynamic from 'next/dynamic';
import { t } from '@/lib/translations';
import { formatNumber } from '@/lib/utils';
import StatCard from '@/components/ui/StatCard';
import ActionButton from '@/components/ui/ActionButton';
import MobilePaymentPeriod from '@/components/mobile/MobilePaymentPeriod';
import MobileChatModal from '@/components/mobile/MobileChatModal';
import Image from 'next/image';
import { 
  Users, Calendar, DollarSign, Edit, Trash2, Download, 
  ChevronDown, X, QrCode, Dice5, MessageCircle, Shield,
  Clock, CheckCircle, AlertCircle, TrendingUp, FileText,
  UserPlus, Eye
} from 'lucide-react';
import { exportDetailedScheduleToExcel, exportDetailedScheduleToPDF } from '@/lib/export';

const LuckyWheelModal = dynamic(() => import('@/components/hui/LuckyWheelModal'), {
  ssr: false,
  loading: () => <p>Loading wheel...</p>
});

export default function HuiDetailPage({ params }) {
  const router = useRouter();
  const { showToast } = useToast();
  const { data: session } = useSession();
  const vietnamDateString = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const [hui, setHui] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('schedules');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHotHuiModalOpen, setIsHotHuiModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hotHuiKy, setHotHuiKy] = useState('');
  const [hotHuiMemberId, setHotHuiMemberId] = useState('');
  const [hotHuiThamKeu, setHotHuiThamKeu] = useState('');
  const [hotHuiThao, setHotHuiThao] = useState('');
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editedHui, setEditedHui] = useState(null);
  const [invoiceData, setInvoiceData] = useState(null);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [isBankInfoModalOpen, setIsBankInfoModalOpen] = useState(false);
  const [showMobileExport, setShowMobileExport] = useState(false);
  const isMobile = useIsMobile();

  const canManage = useMemo(() => {
    if (!session || !hui) return false;
    if (session.user.role === 'ADMIN') return true;
    if (hui.ownerId === session.user.id) return true;
    return hui.permissions?.some(p => p.userId === session.user.id && p.permission === 'MANAGE');
  }, [session, hui]);

  const isHuiMember = useMemo(() => {
    if (!session || !hui || !hui.members) return false;
    return hui.members.some(member => member.userId === session.user.id);
  }, [session, hui]);

  const memberOptions = useMemo(() => {
    if (!hui?.members) return [];
    const paidMemberIds = new Set(
      hui.payments
        .filter(p => p.potTakerMemberId !== null)
        .map(p => p.potTakerMemberId)
    );
    return hui.members
      .filter(member => !paidMemberIds.has(member.id))
      .map(member => ({ value: member.id, label: member.user ? member.user.name : member.guestName }));
  }, [hui]);

  const availableKyOptions = useMemo(() => {
    if (!hui?.payments) return [];
    return hui.payments
      .filter(payment => payment.potTakerMemberId === null && payment.transactionStatus !== 'DA_THANH_TOAN' && payment.transactionStatus !== 'HUY')
      .sort((a, b) => a.period - b.period)
      .map(payment => ({ value: String(payment.period), label: `Kỳ ${payment.period}` }));
  }, [hui]);

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
      setEditedHui(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) {
      fetchHuiData();
    }
  }, [params.id]);

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
        const updatedHui = await response.json();
        setHui(updatedHui);
        setEditedHui(updatedHui);
        showToast({ message: "Cập nhật thành công!", type: 'success' });
        return updatedHui;
    } catch (err) {
        setError(err.message);
        showToast({ message: `Lỗi cập nhật: ${err.message}`, type: 'error' });
        return null;
    } finally {
        setLoading(false);
    }
  };

  const handleSavePaymentScheduleChanges = async (updatedScheduleFromTable) => {
    if (!hui || !hui.members) {
      showToast({ message: "Lỗi: Không tìm thấy thông tin hụi hoặc danh sách thành viên.", type: 'error' });
      return;
    }

    const updatedPaymentsPayload = updatedScheduleFromTable.map(item => {
      const parseLocaleNumber = (str) => {
        if (typeof str !== 'string' || !str.trim()) return null;
        return parseFloat(str.replace(/\./g, '').replace(',', '.'));
      };
      
      const parseDueDate = (dateStr) => {
        if (!dateStr) return null;
        // Parse DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
          const year = parseInt(parts[2], 10);
          return new Date(year, month, day);
        }
        return null;
      };
      
      return {
        period: parseInt(item.period, 10),
        dueDate: parseDueDate(item.dueDate),
        amount: parseLocaleNumber(String(item.amountDisplay)),
        potTakerMemberId: item.thanhVienHotHui || null,
        amountCollected: parseLocaleNumber(String(item.tienHot)), // Use recalculated value
        status: item.status,
        thamKeu: parseLocaleNumber(String(item.thamKeu)),
        thao: parseLocaleNumber(String(item.thao)),
        userId: hui.ownerId,
      };
    });

    const huiDataToUpdate = { ...hui, payments: updatedPaymentsPayload };
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
      await fetchHuiData();
    } catch (err) {
       showToast({ message: `Lỗi xóa thành viên: ${err.message}`, type: 'error' });
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
    if (!canManage) {
      showToast({ message: "Chỉ chủ hụi và người quản lý có quyền hốt hụi", type: 'warning' });
      return;
    }
    resetHotHuiForm();
    // Automatically select the next available period
    if (availableKyOptions.length > 0) {
      setHotHuiKy(availableKyOptions[0].value);
    }
    setIsHotHuiModalOpen(true);
  };

  const handleCloseHotHuiModal = () => {
    setIsHotHuiModalOpen(false);
    resetHotHuiForm();
  };

  const handleHotHuiSubmitInternal = async () => {
    if (isSaving) return;
    setIsSaving(true);

    try {
      if (!hotHuiKy || !hotHuiMemberId) {
        showToast({ message: "Vui lòng chọn kỳ hốt và thành viên.", type: 'error' });
        setIsSaving(false);
        return;
      }

      const selectedPeriod = parseInt(hotHuiKy, 10);
      const takerMemberId = hotHuiMemberId;
      const thamKeuValue = parseFloat(hotHuiThamKeu) || 0;
      const thaoValue = parseFloat(hotHuiThao) || 0;

      const payload = JSON.parse(JSON.stringify(hui));
      const paymentIndex = payload.payments.findIndex(p => p.period === selectedPeriod);
      if (paymentIndex === -1) {
        throw new Error(`Không tìm thấy kỳ thanh toán ${selectedPeriod} để cập nhật.`);
      }

      const totalPeriods = payload.totalMembers;
      const currentPeriod = selectedPeriod;
      const baseAmount = payload.amount;

      const huiSongCount = totalPeriods - currentPeriod;
      const huiChetCount = currentPeriod - 1;

      const tienHuiSong = huiSongCount * (baseAmount - thamKeuValue);
      const tienHuiChet = huiChetCount * baseAmount;

      const amountCollected = tienHuiSong + tienHuiChet - thaoValue;

      const paymentToUpdate = payload.payments[paymentIndex];
      paymentToUpdate.potTakerMemberId = takerMemberId;
      paymentToUpdate.thamKeu = thamKeuValue;
      paymentToUpdate.thao = thaoValue;
      paymentToUpdate.amountCollected = amountCollected;
      paymentToUpdate.status = 'DA_THANH_TOAN';
      paymentToUpdate.transactionStatus = 'DA_THANH_TOAN';

      const nextPeriod = selectedPeriod + 1;
      const nextPaymentIndex = payload.payments.findIndex(p => p.period === nextPeriod);
      if (nextPaymentIndex !== -1) {
        const nextPayment = payload.payments[nextPaymentIndex];
        if (!nextPayment.potTakerMemberId) {
          const today = new Date(vietnamDateString);
          today.setHours(0, 0, 0, 0);
          const nextDueDate = new Date(nextPayment.dueDate);
          nextDueDate.setHours(0, 0, 0, 0);

          if (nextDueDate <= today) {
            nextPayment.transactionStatus = 'CHO_THANH_TOAN';
          } else {
            nextPayment.transactionStatus = 'CHUA_DEN_KY';
          }
        }
      }

      const updatedHui = await handleUpdateHui(payload);
      if (updatedHui) {
        handleCloseHotHuiModal();
        return updatedHui;
      }
      return null;
    } catch (err) {
      showToast({ message: `Lỗi khi hốt hụi: ${err.message}`, type: 'error' });
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const handleHotHuiAndPrint = async () => {
    const updatedHui = await handleHotHuiSubmitInternal();
    if (updatedHui) {
      const selectedPeriod = parseInt(hotHuiKy, 10);
      const potTaker = updatedHui.members.find(m => m.id === hotHuiMemberId);
      const period = updatedHui.payments.find(p => p.period === selectedPeriod);
      
      const baseAmount = updatedHui.amount;
      const thamKeuValue = parseFloat(hotHuiThamKeu) || 0;
      const thaoValue = parseFloat(hotHuiThao) || 0;

      const membersWhoHaveTakenPot = new Set(
        updatedHui.payments
          .filter(p => p.period < selectedPeriod && p.potTakerMemberId)
          .map(p => p.potTakerMemberId)
      );

      const huiSongMembers = updatedHui.members.filter(m => m.id !== potTaker.id && !membersWhoHaveTakenPot.has(m.id));
      const huiChetMembers = updatedHui.members.filter(m => m.id !== potTaker.id && membersWhoHaveTakenPot.has(m.id));

      const huiSongCount = updatedHui.totalMembers - selectedPeriod;
      const huiChetCount = selectedPeriod - 1;

      const tienHuiSong = huiSongCount * (baseAmount - thamKeuValue);
      const tienHuiChet = huiChetCount * baseAmount;
      const tienHot = tienHuiSong + tienHuiChet - thaoValue;

      setInvoiceData({
        hui: updatedHui,
        period,
        potTaker,
        calculationDetails: {
          huiSongCount,
          huiChetCount,
          tienHuiSong,
          tienHuiChet,
          thao: thaoValue,
          tienHot,
          huiSongMembers,
          huiChetMembers,
          thamKeu: thamKeuValue,
        },
        bankInfo: updatedHui.manager ? {
          bankName: updatedHui.manager.bankName,
          bankAccountName: updatedHui.manager.bankAccountName,
          bankAccountNumber: updatedHui.manager.bankAccountNumber,
          qrCodeUrl: updatedHui.manager.qrCodeUrl,
        } : null,
      });
    }
  };

  const generatePdf = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    if (!invoiceData) return;

    const invoiceContainer = document.getElementById('invoice-content-for-pdf');
    if (!invoiceContainer) {
      showToast({ message: "Không tìm thấy nội dung hóa đơn để xuất.", type: 'error' });
      return;
    }

    const pages = invoiceContainer.querySelectorAll('.printable-page');
    if (pages.length === 0) {
      showToast({ message: "Không có trang nào để xuất ra PDF.", type: 'error' });
      return;
    }

    showToast({ message: "Bắt đầu tạo PDF, vui lòng chờ...", type: 'info' });
    setIsSaving(true);

    try {
      const pdf = new jsPDF('l', 'mm', 'a4'); // l for landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const canvas = await html2canvas(page, {
          scale: 2,
          useCORS: true,
          logging: false,
          width: page.scrollWidth,
          height: page.scrollHeight,
        });

        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.height / imgProps.width;
        let imgHeight = pdfWidth * ratio;
        
        if (imgHeight > pdfHeight) {
          imgHeight = pdfHeight; // Fit to page height if too long
        }

        if (i > 0) {
          pdf.addPage();
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      }

      pdf.save(`hoa-don-hui-${invoiceData.hui.name}-ky-${invoiceData.period.period}.pdf`);
      showToast({ message: "Tải PDF thành công!", type: 'success' });
    } catch (err) {
      console.error("Lỗi tạo PDF:", err);
      showToast({ message: `Lỗi tạo PDF: ${err.message}`, type: 'error' });
    } finally {
      setInvoiceData(null);
      setIsSaving(false);
    }
  };

  if (loading || !hui) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex justify-center items-center z-50">
        <Loading message="Đang tải thông tin chi tiết hụi, vui lòng chờ..." />
      </div>
    );
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
    { id: 'detailed_schedules', label: 'Lịch chi tiết' }
  ];

  return (
    <>
      {/* Render Modals outside of the conditional rendering to ensure they are always in the DOM */}
      {invoiceData && (
        <Modal
          isOpen={true}
          onClose={() => setInvoiceData(null)}
          title="Hốt tạo hóa đơn"
          size="4xl"
          footer={
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={() => setInvoiceData(null)} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Đóng</button>
              <button onClick={generatePdf} disabled={isSaving} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2">
                <Download className="w-5 h-5" />
                {isSaving ? 'Đang tạo PDF...' : 'Tải xuống PDF'}
              </button>
            </div>
          }
        >
          <div className="max-h-[70vh] overflow-y-auto">
            <HuiInvoice {...invoiceData} />
          </div>
        </Modal>
      )}
      <Toaster />
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Hốt Hụi</h2>
                <button onClick={handleCloseHotHuiModal} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kỳ hốt</label>
                <Select id="hotHuiKy" value={hotHuiKy} onChange={(e) => setHotHuiKy(e.target.value)} options={[{ value: '', label: 'Chọn kỳ hốt' }, ...availableKyOptions]} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" disabled={availableKyOptions.length === 0} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thành viên hốt</label>
                <Select id="hotHuiMemberId" value={hotHuiMemberId} onChange={(e) => setHotHuiMemberId(e.target.value)} options={[{ value: '', label: 'Chọn thành viên' }, ...memberOptions]} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thăm kêu</label>
                  <NumberInput id="hotHuiThamKeu" value={hotHuiThamKeu} onChange={(e) => setHotHuiThamKeu(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Thảo</label>
                  <NumberInput id="hotHuiThao" value={hotHuiThao} onChange={(e) => setHotHuiThao(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={handleCloseHotHuiModal} disabled={isSaving} className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">Hủy</button>
              <button onClick={handleHotHuiAndPrint} disabled={isSaving || !hotHuiKy || !hotHuiMemberId} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                {isSaving ? 'Loading...' : 'Xem trước hóa đơn'}
              </button>
              <button onClick={handleHotHuiSubmitInternal} disabled={isSaving || !hotHuiKy || !hotHuiMemberId} className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">Hốt không hóa đơn</button>
            </div>
          </div>
        </div>
      )}
      <PermissionsModal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} hui={hui} onSave={async (updatedPermissions) => { const payload = { ...hui, permissions: updatedPermissions }; await handleUpdateHui(payload); setIsPermissionsModalOpen(false); }} />
      {isWheelModalOpen && (<LuckyWheelModal isOpen={isWheelModalOpen} onClose={() => setIsWheelModalOpen(false)} members={memberOptions} />)}
      <OwnerBankInfoModal isOpen={isBankInfoModalOpen} onClose={() => setIsBankInfoModalOpen(false)} owner={hui} />

      {isMobile ? (
        <div className="pb-24">
          {/* Mobile View Content */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Số tiền mỗi kỳ</p>
              <p className="text-lg font-bold text-gray-800">{formatNumber(hui?.amount)}</p>
            </div>
            <div className="bg-white rounded-xl p-3 border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Số thành viên</p>
              <p className="text-lg font-bold text-gray-800">{hui?.members?.length || 0}/{hui?.totalMembers || 0}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Tiến độ</span>
              <span className="text-sm font-bold text-gray-800">Kỳ {completedPayments}/{totalRounds}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div className="bg-red-600 h-2 rounded-full" style={{width: `${progressPercentage}%`}}></div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <button onClick={handleOpenHotHuiModal} className="flex flex-col items-center gap-2 bg-red-600 text-white rounded-xl p-3">
              <TrendingUp className="w-5 h-5" />
              <span className="text-xs font-semibold">Hốt Hụi</span>
            </button>
            <button onClick={() => setIsWheelModalOpen(true)} className="flex flex-col items-center gap-2 bg-yellow-500 text-white rounded-xl p-3">
              <Dice5 className="w-5 h-5" />
              <span className="text-xs font-semibold">Quay hụi</span>
            </button>
            <button onClick={() => setIsBankInfoModalOpen(true)} className="flex flex-col items-center gap-2 bg-green-500 text-white rounded-xl p-3">
              <QrCode className="w-5 h-5" />
              <span className="text-xs font-semibold">QR</span>
            </button>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
            <div className="flex border-b border-gray-200 overflow-x-auto">
              <button onClick={() => setActiveTab('info')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'info' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}>Chi tiết</button>
              <button onClick={() => setActiveTab('members')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'members' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}>Thành viên</button>
              <button onClick={() => setActiveTab('schedules')} className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'schedules' ? 'text-red-600 border-b-2 border-red-600' : 'text-gray-600'}`}>Lịch</button>
            </div>
            <div className="p-4">
              {activeTab === 'info' && ( <div className="space-y-3"> <div> <p className="text-xs text-gray-500 mb-1">Tên Hụi</p> <p className="text-gray-800 font-medium">{hui?.name}</p> </div> <div> <p className="text-xs text-gray-500 mb-1">Trạng thái</p> <p className="text-gray-800 font-medium">{(() => { const { getHuiStatusDisplayText } = require('@/lib/huiStatus'); return getHuiStatusDisplayText(hui?.status); })()}</p> </div> <div> <p className="text-xs text-gray-500 mb-1">Ngày bắt đầu</p> <p className="text-gray-800 font-medium">{new Date(hui?.startDate).toLocaleDateString('vi-VN')}</p> </div> <div> <p className="text-xs text-gray-500 mb-1">Chu kỳ</p> <p className="text-gray-800 font-medium">{t(hui?.frequency)}</p> </div> </div> )}
              {activeTab === 'members' && ( <div> <div className="flex justify-between items-center mb-4"> <h2 className="text-lg font-semibold text-gray-800">Thành viên ({hui?.members?.length || 0})</h2> {canManage && ( <Link href={`/members/create?huiId=${hui?.id}`}> <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"> <UserPlus className="w-4 h-4" /> <span className="text-sm font-medium">Thêm</span> </button> </Link> )} </div> <div className="space-y-3"> {hui?.members?.map(member => ( <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"> <div className="flex items-center gap-3"> <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold"> {member.user ? member.user.name.charAt(0) : member.guestName.charAt(0)} </div> <div> <p className="font-medium text-gray-800 text-sm">{member.user ? member.user.name : member.guestName}</p> <p className="text-xs text-gray-500">{hui.ownerId === member.userId ? 'Chủ hụi' : 'Thành viên'}</p> </div> </div> </div> ))} </div> </div> )}
              {activeTab === 'schedules' && ( <div> <div className="relative flex justify-end mb-4"> <button onClick={() => setShowMobileExport(!showMobileExport)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"> <Download className="w-4 h-4" /> <span className="text-sm font-medium">Export</span> <ChevronDown className="w-4 h-4" /> </button> {showMobileExport && ( <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg z-20"> <button onClick={() => { exportDetailedScheduleToPDF(hui); setShowMobileExport(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button> <button onClick={() => { exportDetailedScheduleToExcel(hui); setShowMobileExport(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button> </div> )} </div> <div className="space-y-3"> {hui?.payments?.map(payment => ( <MobilePaymentPeriod key={payment.id} payment={payment} hui={hui} /> ))} </div> </div> )}
            </div>
          </div>
          <MobileChatModal huiId={hui.id} />
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {/* Desktop View Content */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{hui?.name}</h1>
                  <p className="text-sm text-gray-500">Quản lý chi tiết hụi</p>
                </div>
              </div>
              {canManage && (
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="text-sm font-medium">Xóa hụi</span>
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard label="Số tiền mỗi kỳ" value={formatNumber(hui?.amount)} icon={DollarSign} color="red" />
              <StatCard label="Số thành viên" value={`${hui?.members?.length || 0}/${hui?.totalMembers || 0}`} icon={Users} color="blue" />
              <StatCard label="Chu kỳ" value={t(hui?.frequency)} icon={Calendar} color="purple" />
              <StatCard label="Trạng thái hụi" value={t(hui?.status)} icon={CheckCircle} color="green" />
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Tiến độ</span>
                <span className="text-sm font-bold text-gray-800">
                  Kỳ {completedPayments}/{totalRounds}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-red-600 to-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(progressPercentage)}% hoàn thành
              </p>
            </div>

            {(canManage || isHuiMember) && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ActionButton
                  onClick={handleOpenHotHuiModal}
                  disabled={loading || hui?.status !== 'ACTIVE' || availableKyOptions.length === 0}
                  icon={TrendingUp}
                  text="Hốt Hụi"
                  color="red"
                />
                <ActionButton
                  onClick={() => setIsWheelModalOpen(true)}
                  disabled={loading || hui?.status !== 'ACTIVE' || memberOptions.length === 0}
                  icon={Dice5}
                  text="Quay hụi"
                  color="yellow"
                />
                <ActionButton
                  onClick={() => setIsBankInfoModalOpen(true)}
                  disabled={loading}
                  icon={QrCode}
                  text="QR chuyển khoản"
                  color="green"
                />
              </div>
            )}
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="border-b border-gray-200">
                <div className="flex gap-1 p-2">
                  {tabItems.map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-red-600 text-white'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-6">
                {activeTab === 'info' && (
                  <div>
                    <div className="flex items-start justify-between mb-6 gap-8">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Chi tiết Hụi</h3>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600">Tên Hụi</label>
                            {isEditingInfo ? (
                              <Input value={editedHui.name} onChange={(e) => setEditedHui({ ...editedHui, name: e.target.value })} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                              <p className="mt-1 text-gray-800 font-medium">{hui?.name}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Mô tả</label>
                            {isEditingInfo ? (
                              <textarea value={editedHui.description} onChange={(e) => setEditedHui({ ...editedHui, description: e.target.value })} rows={3} className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                              <p className="mt-1 text-gray-800">{hui?.description || 'Không có mô tả'}</p>
                            )}
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Chủ Hụi</label>
                            <p className="mt-1 text-gray-800 font-medium">{hui?.manager?.name || hui?.ownerGuestName || 'N/A'}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ngày bắt đầu</label>
                            <p className="mt-1 text-gray-800 font-medium">{new Date(hui?.startDate).toLocaleDateString('vi-VN')}</p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-600">Ngày kết thúc (dự kiến)</label>
                            <p className="mt-1 text-gray-800 font-medium">{hui?.endDate ? new Date(hui.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}</p>
                          </div>
                        </div>

                        {isEditingInfo && (
                          <div className="flex justify-start pt-4 mt-4 border-t border-gray-200">
                            <button onClick={async () => { await handleUpdateHui(editedHui); setIsEditingInfo(false); }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                              Lưu thay đổi
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex flex-col gap-3">
                        <button 
                          onClick={() => setIsEditingInfo(!isEditingInfo)}
                          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                        >
                          <Edit className="w-4 h-4" />
                          <span className="text-sm font-medium">{isEditingInfo ? 'Hủy' : 'Chỉnh sửa'}</span>
                        </button>
                        <button onClick={() => setIsPermissionsModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors whitespace-nowrap">
                          <Shield className="w-4 h-4" />
                          <span className="text-sm font-medium">Quản lý quyền</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'members' && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">Danh sách thành viên ({hui?.members?.length || 0})</h2>
                      {canManage && (
                        <Link href={`/members/create?huiId=${hui?.id}`}>
                          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                            <UserPlus className="w-4 h-4" />
                            <span className="text-sm font-medium">Thêm thành viên</span>
                          </button>
                        </Link>
                      )}
                    </div>
                    <MemberList members={hui?.members || []} huiId={hui?.id} onDeleteMember={handleDeleteMember} disabled={loading} canManage={canManage} />
                  </div>
                )}

                {activeTab === 'schedules' && (
                  <div>
                    {hui ? (
                      <PaymentScheduleTable huiGroup={hui} currentDateString={vietnamDateString} onSaveChanges={handleSavePaymentScheduleChanges} disabled={loading || !canManage} />
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

              </div>
            </div>
          </div>
          <ChatModal huiId={hui?.id} />
        </>
      )}
    </>
  );
}
