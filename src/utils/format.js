/**
 * Format number to Vietnamese Dong currency format (e.g. 1.250.000₫)
 */
export function formatVND(amount) {
  if (amount === undefined || amount === null) return '0₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(amount).replace('₫', '₫');
}

/**
 * Format ISO date string to localized Vietnamese format
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/**
 * Order status helper to get Vietnamese label and badge color classes
 */
export function getOrderStatusBadge(status) {
  switch (status) {
    case 'pending':
      return {
        label: 'Chờ xác nhận',
        color: 'bg-amber-100 text-amber-800 border-amber-200',
        dot: 'bg-amber-500',
        step: 1
      };
    case 'confirmed':
      return {
        label: 'Đã xác nhận',
        color: 'bg-blue-100 text-blue-800 border-blue-200',
        dot: 'bg-blue-500',
        step: 2
      };
    case 'shipping':
      return {
        label: 'Đang vận chuyển',
        color: 'bg-purple-100 text-purple-800 border-purple-200',
        dot: 'bg-purple-500',
        step: 3
      };
    case 'delivered':
      return {
        label: 'Giao hàng thành công',
        color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        dot: 'bg-emerald-500',
        step: 4
      };
    case 'cancelled':
      return {
        label: 'Đã hủy',
        color: 'bg-red-100 text-red-800 border-red-200',
        dot: 'bg-red-500',
        step: 0
      };
    default:
      return {
        label: status || 'Chờ xử lý',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        dot: 'bg-gray-500',
        step: 1
      };
  }
}

