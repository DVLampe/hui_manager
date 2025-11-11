'use client';
import React from 'react';
import Link from 'next/link';
import { formatVietnameseCurrency } from '@/lib/utils';

export default function MobileHuiCard({ hui }) {
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
      <button className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium">
        Xem chi tiết
      </button>
    </Link>
  );
}
