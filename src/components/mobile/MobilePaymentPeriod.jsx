'use client';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { t } from '@/lib/translations';
import { formatVietnameseCurrency } from '@/lib/utils';

export default function MobilePaymentPeriod({ payment, hui }) {
  const [isOpen, setIsOpen] = useState(false);

  const potTaker = hui.members.find(m => m.id === payment.potTakerMemberId);
  const membersWhoHaveTakenPot = new Set(
    hui.payments
      .filter(p => p.period < payment.period && p.potTakerMemberId)
      .map(p => p.potTakerMemberId)
  );

  const huiSongMembers = hui.members.filter(m => m.id !== potTaker?.id && !membersWhoHaveTakenPot.has(m.id));
  const huiChetMembers = hui.members.filter(m => m.id !== potTaker?.id && membersWhoHaveTakenPot.has(m.id));

  return (
    <div className="p-3 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center" onClick={() => setIsOpen(!isOpen)}>
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-bold text-gray-800">Kỳ {payment.period}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-semibold ${payment.status === 'DA_THANH_TOAN' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {t(payment.status)}
            </span>
          </div>
          <p className="text-xs text-gray-500">{new Date(payment.dueDate).toLocaleDateString('vi-VN')}</p>
          {potTaker && <p className="text-sm text-gray-800 mt-1">Người hốt: {potTaker.user?.name || potTaker.guestName}</p>}
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
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
