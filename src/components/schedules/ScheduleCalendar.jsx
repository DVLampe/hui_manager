// src/components/schedules/ScheduleCalendar.jsx
export function ScheduleCalendar({ schedules }) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Lịch thanh toán
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <ul className="divide-y divide-gray-200">
            {schedules.map((schedule) => (
              <li key={schedule.id} className="px-4 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {schedule.huiName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Số tiền: {schedule.amount.toLocaleString()}đ
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">
                      Ngày đóng: {new Date(schedule.dueDate).toLocaleDateString()}
                    </p>
                    <p className={`text-sm ${
                      schedule.status === 'COMPLETED' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {schedule.status}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }