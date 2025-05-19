export function SmallCard({ title, value, percent, sub1, sub2, sub1Label, sub2Label, highlight }) {
  return (
    <div className="bg-primary-50 rounded-lg shadow-sm p-6 min-w-[220px] max-w-xs flex-1 mx-1 border-2 border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-gray-600 font-medium">{title}</span>
        {percent && (
          <span className="text-xs text-green-500 font-semibold">{percent}</span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
      {(sub1 || sub2) && (
        <div className="flex justify-between text-xs text-gray-500">
          <div>
            {sub1Label && <span>{sub1Label} </span>}
            <span className="font-semibold text-gray-700">{sub1}</span>
          </div>
          <div>
            {sub2Label && <span>{sub2Label} </span>}
            <span className="font-semibold text-gray-700">{sub2}</span>
          </div>
        </div>
      )}
    </div>
  )
}
