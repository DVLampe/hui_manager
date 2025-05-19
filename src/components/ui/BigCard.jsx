export function BigCard({ title, status, amount, members, nextPayment, children, arrayOrString }) {
  return (
    <div className="bg-white rounded-lg shadow p-8 mb-8 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <span className="text-xs font-semibold text-green-600">{status}</span>
      </div>
      <div className="flex gap-8 mb-2">
        <div>
          <div className="text-xs text-gray-500">Amount</div>
          <div className="font-semibold">{amount}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Members</div>
          <div className="font-semibold">{Array.isArray(members) ? members.length : 0}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500">Next Payment</div>
          <div className="font-semibold">{nextPayment}</div>
        </div>
      </div>
      {arrayOrString && arrayOrString.length > 0 && (
        <div className="text-xs text-gray-500">Данные: {arrayOrString.length}</div>
      )}
      {children}
    </div>
  )
}
