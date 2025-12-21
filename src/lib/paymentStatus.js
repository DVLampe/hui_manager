// Unified status system for payment schedules
export const PAYMENT_STATUS = {
  CHUA_DEN_KY: 'CHUA_DEN_KY',
  CHO_THANH_TOAN: 'CHO_THANH_TOAN', 
  DA_THANH_TOAN: 'DA_THANH_TOAN',
  HUY: 'HUY'
};

// Standard status display mapping
export const statusDisplayMap = {
  CHUA_DEN_KY: 'Chưa đến kỳ',
  CHO_THANH_TOAN: 'Chờ thanh toán',
  DA_THANH_TOAN: 'Đã thanh toán', 
  HUY: 'Hủy',
  // Legacy status mappings for backward compatibility
  CHUA_DONG: 'Chưa đến kỳ', // Maps to CHUA_DEN_KY
  CHO_XAC_NHAN: 'Chờ thanh toán', // Maps to CHO_THANH_TOAN
  DA_DONG: 'Đã thanh toán', // Maps to DA_THANH_TOAN
  MIEN_DONG: 'Đã thanh toán', // Maps to DA_THANH_TOAN (miễn đóng = already paid)
  TRE_HAN: 'Hủy', // Maps to HUY (late = cancelled)
};

// Standard color mapping
export const getStatusColor = (status) => {
  // Normalize legacy statuses to standard ones
  const normalizedStatus = normalizeStatus(status);
  
  switch (normalizedStatus) {
    case PAYMENT_STATUS.DA_THANH_TOAN:
      return 'bg-green-100 text-green-700 ring-green-600/20';
    case PAYMENT_STATUS.CHO_THANH_TOAN:
      return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
    case PAYMENT_STATUS.HUY:
      return 'bg-red-100 text-red-700 ring-red-600/20';
    case PAYMENT_STATUS.CHUA_DEN_KY:
    default:
      return 'bg-gray-100 text-gray-600 ring-gray-500/10';
  }
};

// Normalize legacy statuses to standard ones
export const normalizeStatus = (status) => {
  switch (status) {
    case 'DA_DONG':
    case 'MIEN_DONG':
      return PAYMENT_STATUS.DA_THANH_TOAN;
    case 'CHO_XAC_NHAN':
      return PAYMENT_STATUS.CHO_THANH_TOAN;
    case 'CHUA_DONG':
      return PAYMENT_STATUS.CHUA_DEN_KY;
    case 'TRE_HAN':
      return PAYMENT_STATUS.HUY;
    default:
      return status;
  }
};

// Get display text for any status
export const getStatusDisplayText = (status) => {
  return statusDisplayMap[status] || status;
};