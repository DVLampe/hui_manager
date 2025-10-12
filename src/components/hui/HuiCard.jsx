import Card from '@/components/ui/Card' // Изменено на импорт по умолчанию
import Button from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { StatusBadge } from '@/components/ui/StatusBadge'

export function HuiCard({ hui }) {
  return (
    <Card className="overflow-hidden bg-white rounded-lg shadow">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{hui.name}</h3>
          <StatusBadge status={hui.status} />
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

        <div className="mt-6">
          <Button
            href={`/hui/${hui.id}`}
            variant="primary"
            className="w-full"
          >
            Xem chi tiết
          </Button>
        </div>
      </div>
    </Card>
  )
}
