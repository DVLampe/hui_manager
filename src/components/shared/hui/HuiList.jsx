import { useState, useRef } from 'react';
import { formatVietnameseCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { t } from '@/lib/translations';

export function HuiList({ huis, type = 'participating', tableRef }) {
    const router = useRouter();

    const handleRowClick = (huiId) => {
        router.push(`/hui/${huiId}`);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'PENDING': return 'bg-yellow-100 text-yellow-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="bg-white">
            <div className="overflow-y-auto max-h-[600px] relative" ref={tableRef}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tên hụi</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số tiền</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Chu kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày bắt đầu</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày kết thúc</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                {type === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {huis.map((hui) => (
                            <tr key={hui.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(hui.id)}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-red-700 sm:pl-6">{hui.name}</td>
                                <td className="px-3 py-4 text-sm">
                                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(hui.status)}`}>
                                        {t(hui.status)}
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">{formatVietnameseCurrency(hui.amount)}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{hui.ky}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{t(hui.frequency)}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{new Date(hui.startDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{new Date(hui.endDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm">
                                    {type === 'owned' ? (
                                        <span className="text-blue-600">{formatVietnameseCurrency(hui.totalThao)}</span>
                                    ) : (
                                        <span className={hui.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatVietnameseCurrency(hui.profit)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
