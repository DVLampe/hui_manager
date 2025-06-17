import React, { useState } from 'react';
import Button from '@/components/ui/Button';
// Modal import removed as it's no longer used directly here for Hốt hụi

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

  React.useEffect(() => {
    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);
    const initialStartDate = new Date(startDate);
    initialStartDate.setHours(0,0,0,0);

    const generatedSchedule = [];
    for (let i = 0; i < numberOfPeriods; i++) {
      const dueDate = addMonths(new Date(initialStartDate), i * cycleDurationMonths);
      let initialDisplayStatus = 'CHO_THANH_TOAN';
      if (dueDate > today) {
        initialDisplayStatus = 'CHUA_DEN_KY';
      }

      const paymentForPeriod = huiGroup.payments?.find(p => {
        const paymentDate = new Date(p.dueDate);
        // Robust matching based on period if available, otherwise fallback to dueDate
        if (p.period) {
            return p.period === (i + 1);
        }
        return paymentDate.getFullYear() === dueDate.getFullYear() &&
               paymentDate.getMonth() === dueDate.getMonth() &&
               paymentDate.getDate() === dueDate.getDate();
      });

      generatedSchedule.push({
        period: i + 1,
        dueDate: formatDate(dueDate),
        amountDisplay: paymentForPeriod?.amount?.toLocaleString('vi-VN') || parseFloat(amount).toLocaleString('vi-VN'),
        thanhVienHotHui: paymentForPeriod?.memberId || '',
        tienHot: paymentForPeriod?.amountCollected?.toLocaleString('vi-VN') || '',
        status: paymentForPeriod?.transactionStatus || initialDisplayStatus,
        originalAmount: parseFloat(amount).toLocaleString('vi-VN'),
        originalStatus: paymentForPeriod?.transactionStatus || initialDisplayStatus,
        thamKeu: paymentForPeriod?.thamKeu || '',
        thao: paymentForPeriod?.thao || '',
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
            if (p.period) return p.period === (i+1);
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
            thamKeu: paymentForPeriod?.thamKeu || '',
            thao: paymentForPeriod?.thao || '',
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
      const scheduleToSave = editableSchedule.map(item => ({
        ...item,
        period: item.period,
        dueDate: item.dueDate, // Ensure dueDate is passed correctly
        tienHot: item.tienHot ? String(item.tienHot).replace(/[^\d.]/g, '') : null,
        memberId: item.thanhVienHotHui,
        amount: parseFloat(String(item.amountDisplay).replace(/[^\d.]/g, '')),
        thamKeu: item.thamKeu ? String(item.thamKeu).replace(/[^\d.]/g, '') : null,
        thao: item.thao ? String(item.thao).replace(/[^\d.]/g, '') : null,
        status: item.status
      }));
      onSaveChanges(scheduleToSave);
    }
    console.log('Saving changes:', editableSchedule);
    setIsEditing(false);
  };

  const members = huiGroup?.members || [];

  const statusDisplayMap = {
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
  };

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <div className="flex justify-between items-start"> {/* Changed items-center to items-start for better alignment if text wraps */}
            <div>
              <h3 className="text-xl font-semibold leading-6 text-gray-900">
                Lịch thanh toán dự kiến: {huiName}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Tổng số kỳ: {numberOfPeriods}, Số tiền mỗi kỳ: {parseFloat(amount).toLocaleString('vi-VN')} VNĐ
              </p>
              {/* "Hốt hụi" button removed from here */}
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
      </div>

      {/* Modal for "Hốt hụi" and its related state/handlers are removed */}

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
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thăm kêu</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thảo</th>
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
                    {isEditing && !item.thanhVienHotHui ? (
                      <select
                        value={item.thanhVienHotHui}
                        onChange={(e) => handleInputChange(item.period, 'thanhVienHotHui', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="">Chọn thành viên</option>
                        {members.map(member => (
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
                      <input
                        type="text"
                        value={item.thamKeu}
                        onChange={(e) => handleInputChange(item.period, 'thamKeu', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      item.thamKeu
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <input
                        type="text"
                        value={item.thao}
                        onChange={(e) => handleInputChange(item.period, 'thao', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      item.thao
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <select
                        value={item.status}
                        onChange={(e) => handleInputChange(item.period, 'status', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                        // Disable status editing for periods that have been hốt if direct status change isn't desired post-hốt
                        // disabled={!!item.thanhVienHotHui && item.status === 'DA_THANH_TOAN'}
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
                                                      'bg-gray-50 text-gray-600 ring-gray-500/10'
                      }`}>
                        {statusDisplayMap[item.status] || item.status}
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
