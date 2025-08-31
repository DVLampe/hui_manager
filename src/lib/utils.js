import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const THEME = {
  colors: {
    primary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
    },
    secondary: {
      // ... tương tự
    }
  }
}

export function formatCurrency(amount, currency = 'VND') {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatVietnameseCurrency(amount) {
  if (amount === null || amount === undefined) return '';
  const num = Number(amount);
  if (isNaN(num)) return '';

  if (Math.abs(num) >= 1e9) {
    return `${(num / 1e9).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} tỷ đ`;
  }
  if (Math.abs(num) >= 1e6) {
    return `${(num / 1e6).toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} triệu đ`;
  }
  return `${num.toLocaleString('vi-VN')} đ`;
}

export function formatDate(date, format = 'dd/MM/yyyy') {
  if (!date) return ''
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPhone(phone) {
  return /^[0-9]{10,11}$/.test(phone)
}

export function generateId(prefix = '') {
  return `${prefix}${Math.random().toString(36).substr(2, 9)}`
}

export function debounce(func, wait) {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle(func, limit) {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
