const translations = {
  vi: {
    // Frequencies
    DAILY: 'Hàng ngày',
    WEEKLY: 'Hàng tuần',
    MONTHLY: 'Hàng tháng',

    // Hui Statuses
    ACTIVE: 'Đang hoạt động',
    PENDING: 'Đang chờ',
    COMPLETED: 'Đã kết thúc',
    CANCELLED: 'Đã hủy',
    CLOSED: 'Đã đóng', // Assuming CLOSED is a valid status from your description

    // For lowercase variants
    active: 'Đang hoạt động',
    pending: 'Đang chờ',
    completed: 'Đã kết thúc',
    cancelled: 'Đã hủy',
  },
  // English translations can be added here later
  en: {
    DAILY: 'Daily',
    WEEKLY: 'Weekly',
    MONTHLY: 'Monthly',
    ACTIVE: 'Active',
    PENDING: 'Pending',
    COMPLETED: 'Completed',
    CANCELLED: 'Cancelled',
    CLOSED: 'Closed',
    active: 'Active',
    pending: 'Pending',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },
};

// For now, we will default to Vietnamese.
// In the future, this could be dynamic based on user preference.
const currentLanguage = 'vi';

export const t = (key) => {
  return translations[currentLanguage][key] || key;
};
