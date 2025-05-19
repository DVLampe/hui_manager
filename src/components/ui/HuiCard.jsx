import Link from 'next/link'; // Import Link for navigation

/**
 * Card hiển thị thông tin hụi
 * @param {Object} props - Component props
 * @param {Object} props.hui - Thông tin hụi
 */
export default function HuiCard({ hui }) {
  // Format số tiền
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Map status với màu sắc
  const statusColors = {
    ACTIVE: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  const statusDisplayNames = {
    ACTIVE: 'Đang hoạt động',
    COMPLETED: 'Đã kết thúc',
    CANCELLED: 'Đã hủy',
  };

  return (
    <Link href={`/hui/${hui.id}`} className="block hover:shadow-lg transition-shadow duration-200">
      <div className="bg-white rounded-lg shadow p-4 h-full flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-2 truncate" title={hui.name}>{hui.name}</h3>
          
          <div className="space-y-1 text-sm">
            <p className="text-gray-600">
              Số tiền: <span className="font-medium">{formatAmount(hui.amount)}</span>
            </p>
            <p className="text-gray-600">
              Quản lý: <span className="font-medium">{hui.manager?.name || 'N/A'}</span>
            </p>
            <p className="text-gray-600">
              Thành viên: <span className="font-medium">{hui._count?.members || 0} / {hui.totalMembers}</span>
            </p>
            <p className="text-gray-600">
              Chu kỳ: <span className="font-medium">{hui.cycle} tháng</span>
            </p>
            <p className="text-gray-600">
              Ngày bắt đầu: <span className="font-medium">
                {new Date(hui.startDate).toLocaleDateString('vi-VN')}
              </span>
            </p>
            
            {hui.endDate && (
              <p className="text-gray-600">
                Ngày kết thúc: <span className="font-medium">
                  {new Date(hui.endDate).toLocaleDateString('vi-VN')}
                </span>
              </p>
            )}
             <p className="text-gray-600">
              Ngày đóng hụi tiếp theo: <span className="font-medium">
                {hui.nextPaymentDate ? new Date(hui.nextPaymentDate).toLocaleDateString('vi-VN') : 'N/A'}
              </span>
            </p>
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className={`
            px-2 py-1 rounded-full text-xs font-semibold
            ${statusColors[hui.status] || 'bg-yellow-100 text-yellow-800'}
          `}>
            {statusDisplayNames[hui.status] || hui.status}
          </span>
        </div>
      </div>
    </Link>
  );
}
