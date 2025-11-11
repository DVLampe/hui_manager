import Card from '@/components/ui/Card' // Изменено на импорт по умолчанию
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { t } from '@/lib/translations'
import Link from 'next/link'

export function HuiCard({ hui }) {
  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-8">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{hui.name}</h3>
          <span className="text-sm text-gray-500">{t(hui.status)}</span>
        </div>
        
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Số tiền</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrency(hui.amount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Kỳ hiện tại</dt>
            <dd className="text-sm font-medium text-gray-900">
              {hui.currentPeriod}/{hui.numberOfPeriods}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Thanh toán kế tiếp</dt>
            <dd className="text-sm font-medium text-gray-900">
              {hui.nextPaymentDate ? formatDate(hui.nextPaymentDate) : 'N/A'}
            </dd>
          </div>
        </dl>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Link href={`/hui/${hui.id}`}>
            <button className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">
              Xem chi tiết
            </button>
          </Link>
        </div>
      </div>
    </Card>
  )
}
