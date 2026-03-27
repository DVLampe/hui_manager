'use client';
import { useState, useMemo } from 'react';
import { ChevronDown } from 'lucide-react';
import { t } from '@/lib/translations';
import { formatVietnameseCurrency } from '@/lib/utils';
import { getStatusColor, getStatusDisplayText, normalizeStatus } from '@/lib/paymentStatus';

export default function MobilePaymentPeriod({ payment, hui }) {
  const [isOpen, setIsOpen] = useState(false);

  const { huiSongMembers, huiChetMembers, potTakerDetails } = useMemo(() => {
    if (!hui || !payment) {
      return { huiSongMembers: [], huiChetMembers: [], potTakerDetails: null };
    }

    const currentPotTaker = payment.potTakerMemberId 
      ? hui.members.find(m => m.id === payment.potTakerMemberId) 
      : null;

    if (!currentPotTaker) {
      return { huiSongMembers: [], huiChetMembers: [], potTakerDetails: null };
    }

    const membersWhoHaveTakenPotBefore = new Set(
      hui.payments
        .filter(p => p.period < payment.period && p.potTakerMemberId)
        .map(p => p.potTakerMemberId)
    );

    const song = hui.members.filter(m => 
      m.id !== currentPotTaker.id && !membersWhoHaveTakenPotBefore.has(m.id)
    );
    
    const chet = hui.members.filter(m => 
      m.id !== currentPotTaker.id && membersWhoHaveTakenPotBefore.has(m.id)
    );

    return { 
      huiSongMembers: song, 
      huiChetMembers: chet,
      potTakerDetails: currentPotTaker,
    };
  }, [hui, payment]);

  const status = normalizeStatus(payment.transactionStatus || payment.status);

  return (
    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 shadow-sm mb-2">
      <div onClick={() => setIsOpen(!isOpen)}>
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-sm font-bold text-gray-800 block">Kỳ {payment.period}</span>
            <span className="text-xs text-gray-500 block">{new Date(payment.dueDate).toLocaleDateString('vi-VN')}</span>
            {potTakerDetails && <span className="text-xs text-gray-500 block">Người hốt hụi: {potTakerDetails.user?.name || potTakerDetails.guestName}</span>}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${getStatusColor(status)}`}>
            {getStatusDisplayText(status)}
          </span>
        </div>
        
        

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
      {isOpen && potTakerDetails && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="font-semibold text-sm mb-3">Chi tiết kỳ:</h4>
          <div className="text-xs space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Hụi sống ({huiSongMembers.length}) đóng: <span className="font-normal text-green-600">{formatVietnameseCurrency(hui.amount - (payment.thamKeu || 0))}</span></p>
              <p className="text-gray-600 text-[11px] pl-2 mt-1">({huiSongMembers.map(m => m.user?.name || m.guestName).join(', ') || 'Không có'})</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Hụi chết ({huiChetMembers.length}) đóng: <span className="font-normal text-blue-600">{formatVietnameseCurrency(hui.amount)}</span></p>
              <p className="text-gray-600 text-[11px] pl-2 mt-1">({huiChetMembers.map(m => m.user?.name || m.guestName).join(', ') || 'Không có'})</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
