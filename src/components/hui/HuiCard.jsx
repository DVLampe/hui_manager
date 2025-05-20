import { Card } from '@/components/ui/Card'
import Button from '@/components/ui/Button' // Изменено здесь
import { formatCurrency, formatDate, cn } from '@/lib/utils'

export function HuiCard({ hui }) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">{hui.name}</h3>
          <span className={cn(
            'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
            {
              'bg-green-100 text-green-800': hui.status === 'ACTIVE',
              'bg-yellow-100 text-yellow-800': hui.status === 'PENDING',
              'bg-red-100 text-red-800': hui.status === 'CLOSED'
            }
          )}>
            {hui.status}
          </span>
        </div>
        
        <dl className="mt-4 space-y-2">
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Amount</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatCurrency(hui.amount)}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Members</dt>
            <dd className="text-sm font-medium text-gray-900">
              {hui.members.length}/{hui.totalMembers}
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-sm text-gray-500">Next Payment</dt>
            <dd className="text-sm font-medium text-gray-900">
              {formatDate(hui.nextPaymentDate)}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex space-x-3">
          <Button
            href={`/hui/${hui.id}`}
            variant="primary"
            className="flex-1"
          >
            View Details
          </Button>
          <Button
            href={`/hui/${hui.id}/edit`}
            variant="secondary"
            className="flex-1"
          >
            Edit
          </Button>
        </div>
      </div>
    </Card>
  )
}
