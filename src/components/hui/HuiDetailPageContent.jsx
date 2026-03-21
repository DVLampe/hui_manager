'use client';
import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  UserPlus, Eye, Share2
} from 'lucide-react';
import { exportDetailedScheduleToExcel, exportDetailedScheduleToPDF } from '@/lib/export';

const LuckyWheelModal = dynamic(() => import('@/components/hui/LuckyWheelModal'), {
  ssr: false,
  loading: () => <p>Loading wheel...</p>
});

export default function HuiDetailPageContent({ huiData, session, isGuestView, huiId }) {
  const router = useRouter();
  const { showToast } = useToast();
  const vietnamDateString = new Date().toLocaleDateString('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
  });

  const [hui, setHui] = useState(huiData);
  const [loading, setLoading] = useState(false);
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
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [showBankInfoModal, setShowBankInfoModal] = useState(false);
  const [isWheelModalOpen, setIsWheelModalOpen] = useState(false);
  const [shareableLink, setShareableLink] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    setHui(huiData);
    setEditedHui(huiData);
  }, [huiData]);

  const canManage = useMemo(() => {
    if (isGuestView) return true; // Guests can see everything but actions are controlled
    if (!session || !hui) return false;
    if (session.user.role === 'ADMIN') return true;
    if (hui.ownerId === session.user.id) return true;
    const userPermission = hui.permissions?.find(p => p.userId === session.user.id);
    return userPermission?.permission === 'MANAGE';
  }, [session, hui, isGuestView]);

  const isHuiMember = useMemo(() => {
    if (isGuestView) return true;
    if (!session || !hui || !hui.members) return false;
    return hui.members.some(member => member.userId === session.user.id);
  }, [session, hui, isGuestView]);

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
    if (isGuestView) return; // No refetch for guests
    try {
      setLoading(true);
      const response = await fetch(`/api/hui/${huiId}`);
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || `Hui not found (ID: ${huiId})`);
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

  const handleDeleteHui = async () => {
    if (isGuestView) return;
    try {
      setLoading(true);
      const response = await fetch(`/api/hui/${huiId}`, { method: 'DELETE' });
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
    if (isGuestView) return null;
    try {
        setLoading(true);
        const response = await fetch(`/api/hui/${huiId}`, {
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
    if (isGuestView) return;
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
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
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
        amountCollected: parseLocaleNumber(String(item.tienHot)),
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
    if (isGuestView) return;
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
    if (isGuestView) {
      showToast({ message: "Khách không có quyền thực hiện hành động này.", type: 'warning' });
      return;
    }
    if (!canManage) {
      showToast({ message: "Chỉ chủ hụi và người quản lý có quyền hốt hụi", type: 'warning' });
      return;
    }
    resetHotHuiForm();
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
    if (isGuestView) return null;
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
    if (isGuestView) {
        showToast({ message: "Khách không có quyền thực hiện hành động này.", type: 'warning' });
        return;
    }
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
      const pdf = new jsPDF('l', 'mm', 'a4');
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
          imgHeight = pdfHeight;
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

  const handleGenerateShareLink = async () => {
    if (isGuestView) return;
    setIsSharing(true);
    try {
      const response = await fetch(`/api/hui/${huiId}/share`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to generate link');
      }
      const data = await response.json();
      setShareableLink(data.shareableLink);
      setIsShareModalOpen(true);
      showToast({ message: "Link đã được tạo", type: 'success' });
    } catch (error) {
      showToast({ message: `Không thể tạo link chia sẻ. Vui lòng thử lại.`, type: 'error' });
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareableLink);
    showToast({ message: "Link đã được sao chép vào clipboard.", type: 'success' });
  };

  if (loading) {
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
    { id: 'schedules', label: 'Lịch đóng tiền' },
    { id: 'members', label: 'Thành viên' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'info':
        return <p>Info tab content goes here.</p>;
      case 'schedules':
        return (
          <DetailedPaymentScheduleTable
            hui={hui}
            onSaveChanges={handleSavePaymentScheduleChanges}
            canManage={canManage}
            isGuestView={isGuestView}
          />
        );
      case 'members':
        return (
          <MemberList
            members={hui.members}
            ownerId={hui.ownerId}
            onDeleteMember={handleDeleteMember}
            canManage={canManage}
            isGuestView={isGuestView}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Toaster />
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{hui.name}</h1>
        <div className="flex items-center space-x-2 mt-2 md:mt-0">
          {!isGuestView && (
            <ActionButton
              icon={Share2}
              onClick={handleGenerateShareLink}
              label="Chia sẻ"
              loading={isSharing}
              className="bg-blue-500 hover:bg-blue-600"
            />
          )}
          <ActionButton
            icon={Download}
            onClick={() => exportDetailedScheduleToPDF(hui)}
            label="Xuất PDF"
            className="bg-red-500 hover:bg-red-600"
          />
          <ActionButton
            icon={FileText}
            onClick={() => exportDetailedScheduleToExcel(hui)}
            label="Xuất Excel"
            className="bg-green-700 hover:bg-green-800"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-4">
          <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
            {tabItems.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm sm:text-base`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Panels */}
        <div>
          {renderTabContent()}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Chia sẻ hụi"
      >
        <p className="mb-4">Sao chép và chia sẻ link này để người khác xem chi tiết hụi:</p>
        <Input
          type="text"
          value={shareableLink}
          readOnly
          className="mb-4"
        />
        <Button onClick={handleCopyLink}>Sao chép link</Button>
      </Modal>
    </div>
  );
}
