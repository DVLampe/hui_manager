// src/components/payments/PaymentScheduleTable.jsx
import React from 'react';

export default function PaymentScheduleTable({ payments = [], amount = 0 }) {
  // Sort payments by dueDate
  const sortedPayments = [...payments].sort((a, b) => 
    new Date(a.dueDate) - new Date(b.dueDate)
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 border border-gray-200 shadow">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Kỳ
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày đến hạn
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Thành viên
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Số tiền
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Ngày thanh toán
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Trạng thái
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedPayments.map((payment, index) => (
            <tr key={payment.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {payment.cycle || index + 1}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(payment.dueDate).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span className="font-medium text-indigo-600">
                  {payment.member?.user?.name || payment.member?.userId || 'N/A'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.amount?.toLocaleString()}đ
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {payment.paidAt ? new Date(payment.paidAt).toLocaleDateString() : "Chưa thanh toán"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {payment.status === 'COMPLETED' ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Đã thanh toán
                  </span>
                ) : payment.status === 'PENDING' ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    Chờ thanh toán
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    Đã hủy
                  </span>
                )}
              </td>
            </tr>
          ))}
          {sortedPayments.length === 0 && (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                Chưa có lịch thanh toán nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
