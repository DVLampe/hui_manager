'use client';
import React from 'react';
import Link from 'next/link';
import { formatVietnameseCurrency, formatDate } from '@/lib/utils';
import { getHuiStatusColor, getHuiStatusDisplayText } from '@/lib/huiStatus';

export default function MobileHuiCard({ hui, viewMode }) {
  const isOwnerView = viewMode === 'lam_chu';
  const profitLossLabel = isOwnerView ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ';
  const profitLossValue = isOwnerView ? (hui.totalThao || 0) : (hui.profit || 0);

  return (
    <Link href={`/hui/${hui.id}`} className="block bg-white rounded-xl p-4 border border-gray-200 shadow-sm active:scale-98 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-800 truncate" title={hui.name}>{hui.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getHuiStatusColor(hui.status)}`}>
          {getHuiStatusDisplayText(hui.status)}
        </span>
      </div>
      
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
        <div>
          <p className="text-gray-500 text-xs">Số tiền</p>
          <p className="font-bold text-gray-800">{formatVietnameseCurrency(hui.amount)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Kỳ hiện tại</p>
          <p className="font-medium text-gray-800">{hui.currentPeriod || 0}/{hui.numberOfPeriods || 0}</p>
        </div>
        <div className="col-span-2">
          <p className="text-gray-500 text-xs">Thanh toán kế tiếp</p>
          <p className="font-medium text-gray-800">
            {hui.nextPaymentDate ? formatDate(hui.nextPaymentDate) : 'N/A'}
          </p>
        </div>
      </div>

      <div className="border-t border-gray-100 my-3"></div>

      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500">{profitLossLabel}</p>
        <p className={`font-bold ${!isOwnerView && profitLossValue < 0 ? 'text-red-600' : 'text-green-600'}`}>
          {formatVietnameseCurrency(profitLossValue)}
        </p>
      </div>
    </Link>
  );
}
