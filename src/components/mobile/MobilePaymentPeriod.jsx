'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { t } from '@/lib/translations';
import { formatVietnameseCurrency } from '@/lib/utils';

export default function MobilePaymentPeriod({ payment, hui }) {
  const [isOpen, setIsOpen] = useState(false);

  const status = payment.transactionStatus || payment.status;

  const potTaker = hui.members.find(m => m.id === payment.potTakerMemberId);
  const membersWhoHaveTakenPot = new Set(
    hui.payments
      .filter(p => p.period < payment.period && p.potTakerMemberId)
      .map(p => p.potTakerMemberId)
  );

  const huiSongMembers = hui.members.filter(m => m.id !== potTaker?.id && !membersWhoHaveTakenPot.has(m.id));
  const huiChetMembers = hui.members.filter(m => m.id !== potTaker?.id && membersWhoHaveTakenPot.has(m.id));

  const statusDisplayMap = {
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
    DA_DONG: 'Đã đóng',
    CHUA_DONG: 'Chưa đóng',
    MIEN_DONG: 'Miễn đóng',
    TRE_HAN: 'Trễ hạn',
    CHO_XAC_NHAN: 'Chờ xác nhận'
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DA_THANH_TOAN':
      case 'DA_DONG':
        return 'bg-green-100 text-green-700';
      case 'CHO_THANH_TOAN':
      case 'CHO_XAC_NHAN':
        return 'bg-yellow-100 text-yellow-800';
      case 'HUY':
      case 'TRE_HAN':
        return 'bg-red-100 text-red-700';
      case 'MIEN_DONG':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm mb-2">
      <div onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-sm font-bold text-gray-800 block">Kỳ {payment.period}</span>
            <span className="text-xs text-gray-500">{new Date(payment.dueDate).toLocaleDateString('vi-VN')}</span>
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(status)}`}>
            {statusDisplayMap[status] || t(status)}
          </span>
        </div>
        
        {potTaker && <p className="text-sm text-gray-800 mb-2 font-medium">Người hốt: <span className="text-red-600">{potTaker.user?.name || potTaker.guestName}</span></p>}

        <div className="grid grid-cols-3 gap-2 mt-2 bg-white p-2 rounded border border-gray-100">
          <div className="text-center">
             <span className="text-[10px] text-gray-500 uppercase block">Thăm kêu</span>
             <span className="text-xs font-semibold text-gray-800">{payment.thamKeu ? formatVietnameseCurrency(payment.thamKeu) : '-'}</span>
          </div>
          <div className="text-center border-l border-gray-100">
             <span className="text-[10px] text-gray-500 uppercase block">Thảo</span>
             <span className="text-xs font-semibold text-gray-800">{payment.thao ? formatVietnameseCurrency(payment.thao) : '-'}</span>
          </div>
          <div className="text-center border-l border-gray-100">
             <span className="text-[10px] text-gray-500 uppercase block">Tiền hốt</span>
             <span className="text-xs font-semibold text-gray-800">{payment.amountCollected ? formatVietnameseCurrency(payment.amountCollected) : '-'}</span>
          </div>
        </div>

        <div className="flex justify-center mt-2">
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-sm mb-2">Chi tiết kỳ:</h4>
          <div className="text-xs space-y-1">
            <p><strong>Hụi sống ({huiSongMembers.length}):</strong> {huiSongMembers.map(m => m.user?.name || m.guestName).join(', ')}</p>
            <p><strong>Đóng:</strong> {formatVietnameseCurrency(hui.amount - payment.thamKeu)}</p>
            <p><strong>Hụi chết ({huiChetMembers.length}):</strong> {huiChetMembers.map(m => m.user?.name || m.guestName).join(', ')}</p>
            <p><strong>Đóng:</strong> {formatVietnameseCurrency(hui.amount)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
