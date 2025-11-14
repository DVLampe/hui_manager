'use client';
import React from 'react';
import Link from 'next/link';
import { formatVietnameseCurrency } from '@/lib/utils';

export default function MobileHuiCard({ hui, viewMode }) {
  // Mock data for demonstration until API is ready
  const displayData = {
    label: viewMode === 'lam_chu' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ',
    value: viewMode === 'lam_chu' ? (hui.totalBidAmount || 12000000) : (hui.profitOrLoss || -500000),
    isProfit: viewMode !== 'lam_chu' && (hui.profitOrLoss || -500000) >= 0,
    isLoss: viewMode !== 'lam_chu' && (hui.profitOrLoss || -500000) < 0,
  };

  return (
    <Link href={`/hui/${hui.id}`} className="block bg-white rounded-xl p-4 border border-gray-200 shadow-sm active:scale-98 transition-transform">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-bold text-gray-800">{hui.name}</h3>
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          hui.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
        }`}>
          {hui.status === 'ACTIVE' ? 'Đang hoạt động' : 'Đang chờ'}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm mb-3">
        <div>
          <p className="text-gray-500 text-xs">Số tiền</p>
          <p className="font-bold text-gray-800">{formatVietnameseCurrency(hui.amount)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Kỳ hiện tại</p>
          <p className="font-medium text-gray-800">{hui.ky}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs">Thành viên</p>
          <p className="font-medium text-gray-800">{hui.members?.length || 0}</p>
        </div>
      </div>
      <div className="border-t border-gray-100 my-3"></div>
      <div className="flex justify-between items-center text-sm">
        <p className="text-gray-500">{displayData.label}</p>
        <p className={`font-bold ${displayData.isProfit ? 'text-green-600' : ''} ${displayData.isLoss ? 'text-red-600' : ''}`}>
          {formatVietnameseCurrency(displayData.value)}
        </p>
      </div>
    </Link>
  );
}
