// Unified status system for Hui groups
export const HUI_STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
};

// Standard status display mapping for Hui
export const huiStatusDisplayMap = {
  ACTIVE: 'Đang hoạt động',
  COMPLETED: 'Đã kết thúc', 
  CANCELLED: 'Hủy',
  // Legacy status mappings for backward compatibility
  PENDING: 'Đang hoạt động', // Maps to ACTIVE
  CLOSED: 'Đã kết thúc', // Maps to COMPLETED
  HUY: 'Hủy', // Maps to CANCELLED
  // Lowercase variants
  active: 'Đang hoạt động',
  completed: 'Đã kết thúc',
  cancelled: 'Hủy',
  pending: 'Đang hoạt động',
  closed: 'Đã kết thúc',
  huy: 'Hủy'
};

// Standard color mapping for Hui status
export const getHuiStatusColor = (status) => {
  // Normalize to handle both uppercase and lowercase
  const normalizedStatus = normalizeHuiStatus(status);
  
  switch (normalizedStatus) {
    case HUI_STATUS.ACTIVE:
      return 'bg-green-100 text-green-700';
    case HUI_STATUS.COMPLETED:
      return 'bg-blue-100 text-blue-700';
    case HUI_STATUS.CANCELLED:
      return 'bg-red-100 text-red-700';
    default:
      // Also handle direct status comparison for lowercase
      const statusLower = status?.toLowerCase();
      switch (statusLower) {
        case 'active':
        case 'pending':
          return 'bg-green-100 text-green-700';
        case 'completed':
        case 'closed':
          return 'bg-blue-100 text-blue-700';
        case 'cancelled':
        case 'canceled':
        case 'huy':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-600';
      }
  }
};

// Normalize legacy statuses to standard ones
export const normalizeHuiStatus = (status) => {
  const statusLower = status?.toLowerCase();
  const statusUpper = status?.toUpperCase();
  
  switch (statusLower) {
    case 'active':
      return HUI_STATUS.ACTIVE;
    case 'pending':
      return HUI_STATUS.ACTIVE;
    case 'completed':
    case 'closed':
      return HUI_STATUS.COMPLETED;
    case 'cancelled':
    case 'canceled':
    case 'huy':
      return HUI_STATUS.CANCELLED;
    default:
      // Fallback to uppercase comparison
      switch (statusUpper) {
        case 'PENDING':
          return HUI_STATUS.ACTIVE;
        case 'CLOSED':
          return HUI_STATUS.COMPLETED;
        case 'HUY':
          return HUI_STATUS.CANCELLED;
        default:
          return status;
      }
  }
};

// Get display text for any Hui status
export const getHuiStatusDisplayText = (status) => {
  // Try direct lookup first
  if (huiStatusDisplayMap[status]) {
    return huiStatusDisplayMap[status];
  }
  
  // Try normalized status
  const normalized = normalizeHuiStatus(status);
  return huiStatusDisplayMap[normalized] || status;
};