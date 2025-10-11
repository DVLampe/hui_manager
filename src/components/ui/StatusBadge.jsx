// src/components/ui/StatusBadge.jsx
import React from 'react';

const statusDisplayMap = {
  // Payment Statuses
  CHUA_DEN_KY: 'Chưa đến kỳ',
  CHO_THANH_TOAN: 'Chờ thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán',
  HUY: 'Hủy',
  // Contribution Statuses
  CHUA_DONG: 'Chưa đóng',
  DA_DONG: 'Đã đóng',
  MIEN_DONG: 'Miễn đóng (Hốt)',
  TRE_HAN: 'Trễ hạn',
  CHO_XAC_NHAN: 'Chờ xác nhận',
  // Hui Statuses
  active: 'Đang hoạt động',
  pending: 'Chờ bắt đầu',
  completed: 'Đã kết thúc',
  cancelled: 'Đã hủy',
  ACTIVE: 'Đang hoạt động',
  PENDING: 'Chờ bắt đầu',
  COMPLETED: 'Đã kết thúc',
  CANCELLED: 'Đã hủy',
};

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'da_thanh_toan':
    case 'da_dong':
    case 'active':
    case 'completed':
      return 'bg-green-100 text-green-700 ring-green-600/20';
    case 'cho_thanh_toan':
    case 'cho_xac_nhan':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    case 'huy':
    case 'tre_han':
    case 'cancelled':
      return 'bg-red-100 text-red-700 ring-red-600/20';
    case 'mien_dong':
      return 'bg-blue-100 text-blue-700 ring-blue-600/20';
    case 'chua_den_ky':
    case 'chua_dong':
    default:
      return 'bg-gray-100 text-gray-600 ring-gray-500/10';
  }
};

export const StatusBadge = ({ status }) => {
  const displayText = statusDisplayMap[status] || status;
  const colorClasses = getStatusColor(status);

  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${colorClasses}`}>
      {displayText}
    </span>
  );
};
