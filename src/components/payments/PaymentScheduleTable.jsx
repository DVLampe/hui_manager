import React, { useState } from 'react';
import Button from '@/components/ui/Button'; // Assuming you have a Button component

// Helper function to format date as DD/MM/YYYY
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to add months to a date
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

const PaymentScheduleTable = ({ huiGroup, currentDateString, onSaveChanges }) => {
  if (!huiGroup || !huiGroup.startDate) {
    return <p className="text-gray-600">Chưa có thông tin hụi đầy đủ để hiển thị lịch thanh toán.</p>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editableSchedule, setEditableSchedule] = useState([]);

  const numberOfPeriods = huiGroup.totalMembers || 12; // Use totalMembers or fallback
  const { amount, startDate, name: huiName } = huiGroup;
  const cycleDurationMonths = huiGroup.cycle || 1;

  // Initialize schedule or editableSchedule when huiGroup changes or on initial load
  React.useEffect(() => {
    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);
    const initialStartDate = new Date(startDate);
    initialStartDate.setHours(0,0,0,0);

    const generatedSchedule = [];
    for (let i = 0; i < numberOfPeriods; i++) {
      const dueDate = addMonths(new Date(initialStartDate), i * cycleDurationMonths);
      // Default status from Prisma schema is CHO_THANH_TOAN, but frontend logic can override for display
      let initialDisplayStatus = 'CHO_THANH_TOAN'; 
      if (dueDate > today) {
        initialDisplayStatus = 'CHUA_DEN_KY';
      }
      
      const paymentForPeriod = huiGroup.payments?.find(p => {
        // This matching logic for payments to periods needs to be robust.
        // Consider matching by `p.period` if available and reliable.
        const paymentDate = new Date(p.dueDate); // Assuming payment has a dueDate
        return paymentDate.getFullYear() === dueDate.getFullYear() && 
               paymentDate.getMonth() === dueDate.getMonth() &&
               paymentDate.getDate() === dueDate.getDate(); // Be more precise if possible
      });

      generatedSchedule.push({
        period: i + 1,
        dueDate: formatDate(dueDate),
        amountDisplay: paymentForPeriod?.amount?.toLocaleString('vi-VN') || parseFloat(amount).toLocaleString('vi-VN'),
        thanhVienHotHui: paymentForPeriod?.memberId || '',
        tienHot: paymentForPeriod?.amountCollected?.toLocaleString('vi-VN') || '',
        // Use the status from the database (transactionStatus) if available, otherwise use initial display logic
        status: paymentForPeriod?.transactionStatus || initialDisplayStatus, 
        originalAmount: parseFloat(amount).toLocaleString('vi-VN'),
        originalStatus: paymentForPeriod?.transactionStatus || initialDisplayStatus,
      });
    }
    setEditableSchedule(generatedSchedule);
  }, [huiGroup, currentDateString, numberOfPeriods, amount, startDate, cycleDurationMonths]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) { // When toggling from editing to not-editing (Cancel)
        const today = new Date(currentDateString);
        today.setHours(0, 0, 0, 0);
        const initialStartDate = new Date(startDate);
        initialStartDate.setHours(0,0,0,0);

        const resetSchedule = [];
        for (let i = 0; i < numberOfPeriods; i++) {
          const dueDate = addMonths(new Date(initialStartDate), i * cycleDurationMonths);
          let initialDisplayStatus = 'CHO_THANH_TOAN';
          if (dueDate > today) {
            initialDisplayStatus = 'CHUA_DEN_KY';
          }

          const paymentForPeriod = huiGroup.payments?.find(p => {
            const paymentDate = new Date(p.dueDate);
            return paymentDate.getFullYear() === dueDate.getFullYear() && 
                   paymentDate.getMonth() === dueDate.getMonth() &&
                   paymentDate.getDate() === dueDate.getDate();
          });
          resetSchedule.push({
            period: i + 1,
            dueDate: formatDate(dueDate),
            amountDisplay: paymentForPeriod?.amount?.toLocaleString('vi-VN') || parseFloat(amount).toLocaleString('vi-VN'),
            thanhVienHotHui: paymentForPeriod?.memberId || '',
            tienHot: paymentForPeriod?.amountCollected?.toLocaleString('vi-VN') || '',
            status: paymentForPeriod?.transactionStatus || initialDisplayStatus,
            originalAmount: parseFloat(amount).toLocaleString('vi-VN'),
            originalStatus: paymentForPeriod?.transactionStatus || initialDisplayStatus,
          });
        }
        setEditableSchedule(resetSchedule);
    }
  };

  const handleInputChange = (period, field, value) => {
    setEditableSchedule(currentSchedule =>
      currentSchedule.map(item =>
        item.period === period ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSaveChanges = () => {
    if (onSaveChanges) {
      // Ensure the `status` field sent to backend matches the new enum values
      const scheduleToSave = editableSchedule.map(item => ({
        ...item,
        // Ensure `tienHot` is converted to a number or null if that's what backend expects for amountCollected
        tienHot: item.tienHot ? String(item.tienHot).replace(/[^\d.]/g, '') : null, 
        // `memberId` might be what `thanhVienHotHui` represents for saving
        memberId: item.thanhVienHotHui, 
        // Map amountDisplay back to a number if needed for `amount` field when saving
        amount: parseFloat(String(item.amountDisplay).replace(/[^\d.]/g, ''))
      }));
      onSaveChanges(scheduleToSave);
    }
    console.log('Saving changes:', editableSchedule);
    setIsEditing(false);
  };

  const members = huiGroup?.members || [];

  // Map enum values to display text for status
  const statusDisplayMap = {
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
  };

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold leading-6 text-gray-900">
            Lịch thanh toán dự kiến: {huiName}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Tổng số kỳ: {numberOfPeriods}, Số tiền mỗi kỳ: {parseFloat(amount).toLocaleString('vi-VN')} VNĐ
          </p>
        </div>
        <div>
          {isEditing ? (
            <div className="flex space-x-2">
              <Button onClick={handleSaveChanges} variant="primary" size="sm">Lưu thay đổi</Button>
              <Button onClick={handleEditToggle} variant="outline" size="sm">Hủy</Button>
            </div>
          ) : (
            <Button onClick={handleEditToggle} variant="outline" size="sm">Chỉnh sửa</Button>
          )}
        </div>
      </div>
      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Kỳ</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày đến hạn</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số tiền kỳ (VNĐ)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thành viên hốt hụi</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tiền hốt (VNĐ)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {editableSchedule.map((item) => (
                <tr key={item.period}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.period}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.dueDate}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={item.amountDisplay}
                        onChange={(e) => handleInputChange(item.period, 'amountDisplay', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                      />
                    ) : (
                      item.amountDisplay
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <select 
                        value={item.thanhVienHotHui} 
                        onChange={(e) => handleInputChange(item.period, 'thanhVienHotHui', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="">Chọn thành viên</option>
                        {members.map(member => (
                          // Assuming member.user.id and member.user.name if user is nested
                          <option key={member.id || member.userId} value={member.id || member.userId}>
                            {member.user?.name || member.name || member.userId}
                          </option>
                        ))}
                      </select>
                    ) : (
                      members.find(m => (m.id || m.userId) === item.thanhVienHotHui)?.user?.name || 
                      members.find(m => (m.id || m.userId) === item.thanhVienHotHui)?.name || 
                      item.thanhVienHotHui || 'N/A'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {isEditing ? (
                      <input 
                        type="text" 
                        value={item.tienHot}
                        onChange={(e) => handleInputChange(item.period, 'tienHot', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                      />
                    ) : (
                      item.tienHot
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <select 
                        value={item.status} // This should be one of CHUA_DEN_KY, CHO_THANH_TOAN, etc.
                        onChange={(e) => handleInputChange(item.period, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="CHUA_DEN_KY">Chưa đến kỳ</option>
                        <option value="CHO_THANH_TOAN">Chờ thanh toán</option>
                        <option value="DA_THANH_TOAN">Đã thanh toán</option>
                        <option value="HUY">Hủy</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        item.status === 'CHUA_DEN_KY' ? 'bg-gray-50 text-gray-600 ring-gray-500/10' :
                        item.status === 'CHO_THANH_TOAN' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                        item.status === 'DA_THANH_TOAN' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                        item.status === 'HUY' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                      'bg-gray-50 text-gray-600 ring-gray-500/10' // Default for any other unmapped status
                      }`}>
                        {statusDisplayMap[item.status] || item.status} {/* Use map for display */}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentScheduleTable;
