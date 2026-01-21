import Card from '@/components/ui/Card' // Изменено на импорт по умолчанию
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils';
import { getHuiStatusColor, getHuiStatusDisplayText } from '@/lib/huiStatus';
import Link from 'next/link';

export function HuiCard({ hui, viewMode }) { // Added viewMode
  const isOwnerView = viewMode === 'lam_chu';
  const profitLossLabel = isOwnerView ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ';
  const profitLossValue = isOwnerView ? (hui.totalThao || 0) : (hui.profit || 0);

  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow flex flex-col h-full">
      <div className="p-6 flex-grow">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900 truncate" title={hui.name}>{hui.name}</h3>
          <span className={`text-sm font-semibold px-2 py-1 rounded-full whitespace-nowrap ${getHuiStatusColor(hui.status)}`}>
            {getHuiStatusDisplayText(hui.status)}
          </span>
        </div>
        
        <dl className="space-y-3">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Số tiền</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrency(hui.amount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Kỳ hiện tại</dt>
            <dd className="text-sm font-medium text-gray-900">
              {hui.currentPeriod || 0}/{hui.numberOfPeriods || 0}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Thanh toán kế tiếp</dt>
            <dd className="text-sm font-medium text-gray-900">
              {hui.nextPaymentDate ? formatDate(hui.nextPaymentDate) : 'N/A'}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">{profitLossLabel}</dt>
            <dd className={`text-sm font-bold ${!isOwnerView && profitLossValue < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {formatCurrency(profitLossValue)}
            </dd>
          </div>
        </dl>
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
        <Link href={`/hui/${hui.id}`} className="block">
          <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
            Xem chi tiết
          </button>
        </Link>
      </div>
    </Card>
  )
}
