import { formatVietnameseCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';

// src/components/hui/HuiList.jsx
export function HuiList({ huis }) {
    const router = useRouter();

    const handleRowClick = (huiId) => {
        router.push(`/hui/${huiId}`);
    };

    return (
        <div className="bg-white shadow sm:rounded-md">
            <div className="overflow-y-auto max-h-[600px] relative">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tên hụi</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số tiền</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Chu kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày bắt đầu</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Lợi nhuận</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {huis.map((hui) => (
                            <tr key={hui.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(hui.id)}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">{hui.name}</td>
                                <td className="px-3 py-4 text-sm">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${hui.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                        {hui.status}
                                    </span>
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">{formatVietnameseCurrency(hui.amount)}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{hui.ky}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{hui.frequency}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{new Date(hui.startDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm">
                                    <span className={hui.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                        {formatVietnameseCurrency(hui.profit)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
