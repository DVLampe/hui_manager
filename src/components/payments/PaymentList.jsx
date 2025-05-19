// src/components/payments/PaymentList.jsx
export default function PaymentList({ payments }) {
    if (!payments || payments.length === 0) {
      return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6 text-center text-gray-500">
          Chưa có thanh toán nào.
        </div>
      );
    }
    
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {payments.map((payment) => (
            <li key={payment.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {payment.group?.name || "Thanh toán"}
                  </p>
                  <div className="ml-2 flex-shrink-0 flex">
                    <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      payment.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {payment.status}
                    </p>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Số tiền: {typeof payment.amount === 'number' ? payment.amount.toLocaleString() : 
                               (payment.amount?.toLocaleString ? payment.amount.toLocaleString() : '0')}đ
                    </p>
                    {payment.member?.user && (
                      <p className="flex items-center text-sm text-gray-500 ml-4">
                        Người đóng: {payment.member.user.name || payment.member.user.email}
                      </p>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>
                      {payment.dueDate && `Ngày đóng: ${new Date(payment.dueDate).toLocaleDateString()}`}
                      {payment.paidAt && ` • Đã thanh toán: ${new Date(payment.paidAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }