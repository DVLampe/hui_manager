import React, { useState, useEffect } from 'react';

// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to add months to a date
const addMonths = (date, months) => {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
};

// Helper function to format numbers with dot as thousands separator
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) {
    return '';
  }
  return parseFloat(num).toLocaleString('vi-VN');
};

const DetailedPaymentScheduleTable = ({ huiGroup, currentDateString }) => {
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  const { members, amount, name: huiName } = huiGroup || {};

  useEffect(() => {
    if (!huiGroup || !huiGroup.startDate || !huiGroup.members) {
      setScheduleDetails([]);
      return;
    }

    const numberOfPeriods = huiGroup.totalMembers || huiGroup.members.length || 0;
    const { startDate, cycle = 1 } = huiGroup;
    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);
    const initialStartDate = new Date(startDate);
    initialStartDate.setHours(0, 0, 0, 0);

    const generatedScheduleDetails = [];
    for (let i = 0; i < numberOfPeriods; i++) {
      const periodNumber = i + 1;
      const dueDate = addMonths(new Date(initialStartDate), i * cycle);
      let periodStatusOverall = 'CHUA_DEN_KY';
      if (dueDate <= today) {
        periodStatusOverall = 'CHO_THANH_TOAN';
      }

      const mainPaymentForPeriod = huiGroup.payments?.find(p => p.period === periodNumber);
      if (mainPaymentForPeriod?.transactionStatus === 'DA_THANH_TOAN') {
        periodStatusOverall = 'DA_THANH_TOAN';
      }

      const periodDetail = {
        period: periodNumber,
        dueDate: formatDate(dueDate),
        rawDueDate: dueDate, // Keep raw date for comparisons
        huiMasterMemberId: mainPaymentForPeriod?.memberId || null,
        amountCollected: mainPaymentForPeriod?.amountCollected,
        status: mainPaymentForPeriod?.transactionStatus || periodStatusOverall,
        thamKeu: mainPaymentForPeriod?.thamKeu,
        thao: mainPaymentForPeriod?.thao,
        subRows: [],
      };

      const amountPerMemberBase = parseFloat(huiGroup.amount);

      huiGroup.members.forEach(member => {
        const isHuiMasterThisPeriod = member.id === periodDetail.huiMasterMemberId;
        let paymentStatusForMember = 'CHUA_DONG';
        let individualPaymentAmount = amountPerMemberBase;

        if (periodDetail.status === 'DA_THANH_TOAN') {
          if (isHuiMasterThisPeriod) {
            paymentStatusForMember = 'HOT_HUI';
            individualPaymentAmount = 0;
          } else {
            paymentStatusForMember = 'DA_DONG';
            if (periodDetail.thamKeu && parseFloat(periodDetail.thamKeu) > 0) {
              individualPaymentAmount = parseFloat(periodDetail.thamKeu);
            }
          }
        } else if (periodDetail.status === 'CHO_THANH_TOAN') {
          if (isHuiMasterThisPeriod) {
            paymentStatusForMember = 'DUOC_HOT';
            individualPaymentAmount = 0;
          } else {
            paymentStatusForMember = 'CHUA_DONG';
          }
        } else if (periodDetail.status === 'CHUA_DEN_KY') {
          paymentStatusForMember = 'CHUA_DEN_KY';
          if (isHuiMasterThisPeriod) {
            paymentStatusForMember = 'DUOC_HOT_SAU';
            individualPaymentAmount = 0;
          }
        }

        periodDetail.subRows.push({
          memberId: member.id,
          memberName: member.user?.name || member.name || `Member ${member.id}`,
          amountDue: individualPaymentAmount,
          status: paymentStatusForMember,
        });
      });
      generatedScheduleDetails.push(periodDetail);
    }
    setScheduleDetails(generatedScheduleDetails);
    // Select the first period by default, or the current period if applicable
    const currentPeriodIndex = generatedScheduleDetails.findIndex(p => p.rawDueDate >= today);
    setSelectedPeriodIndex(currentPeriodIndex !== -1 ? currentPeriodIndex : 0);

  }, [huiGroup, currentDateString]);

  const statusDisplayMap = {
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
    CHUA_DONG: 'Chưa đóng',
    DA_DONG: 'Đã đóng',
    HOT_HUI: 'Đã hốt hụi',
    DUOC_HOT: 'Đến lượt hốt',
    DUOC_HOT_SAU: 'Sẽ hốt kỳ này',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DA_THANH_TOAN':
      case 'DA_DONG':
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'CHO_THANH_TOAN':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'HUY':
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'HOT_HUI':
      case 'DUOC_HOT':
      case 'DUOC_HOT_SAU':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      default:
        return 'bg-gray-100 text-gray-600 ring-gray-500/10';
    }
  };

  const getMemberOverallStatus = (memberId, currentPeriod) => {
    if (memberId === currentPeriod.huiMasterMemberId) {
      return 'Hốt hụi'; // Collector of the current period
    }
    // Check if member collected in any previous period
    for (let i = 0; i < currentPeriod.period - 1; i++) {
      if (scheduleDetails[i] && scheduleDetails[i].huiMasterMemberId === memberId) {
        return 'Hụi chết'; // Collected in a past period
      }
    }
    return 'Hụi sống'; // Has not collected yet
  };
  
  if (!huiGroup || !huiGroup.startDate || !huiGroup.members) {
    return <p className="text-center text-gray-600 py-10">Chưa có thông tin hụi đầy đủ để hiển thị lịch thanh toán chi tiết.</p>;
  }
  
  if (scheduleDetails.length === 0) {
    return <p className="text-center text-gray-500 py-10">Không có dữ liệu chi tiết để hiển thị.</p>;
  }

  const selectedPeriodData = scheduleDetails[selectedPeriodIndex];

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Lịch thanh toán chi tiết: {huiName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Tổng số kỳ: {scheduleDetails.length}, Số tiền gốc mỗi kỳ: {formatNumber(amount)} VNĐ
        </p>
      </div>

      <div className="flex min-h-[600px]">  {/* Added min-h for better visual */}
        {/* Left Panel: List of Periods */}
        <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
          <nav className="p-2 space-y-1">
            {scheduleDetails.map((period, index) => (
              <button
                key={`period-nav-${period.period}`}
                onClick={() => setSelectedPeriodIndex(index)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium flex justify-between items-center 
                            ${selectedPeriodIndex === index 
                              ? 'bg-indigo-50 text-indigo-700' 
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
              >
                <div>
                  <p className={`${selectedPeriodIndex === index ? 'font-semibold' : 'font-normal'}`}>Kỳ {period.period}</p>
                  <p className={`text-xs ${selectedPeriodIndex === index ? 'text-indigo-600' : 'text-gray-500'}`}>{period.dueDate}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset 
                                ${getStatusColor(period.status).replace('bg-', 'bg-opacity-20 bg-') /* Softer bg for list item badges */}
                                ${selectedPeriodIndex === index ? '' : 'opacity-80'}`}>
                    {statusDisplayMap[period.status] || period.status}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Right Panel: Details of Selected Period */}
        <div className="w-3/4 p-6 overflow-y-auto">
          {selectedPeriodData ? (
            <>
              {/* Period Summary */}
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Chi tiết Kỳ {selectedPeriodData.period}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  <p><span className="text-gray-500">Ngày đến hạn:</span> <span className="font-medium">{selectedPeriodData.dueDate}</span></p>
                  <p><span className="text-gray-500">Trạng thái kỳ:</span> 
                    <span className={`ml-1 inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(selectedPeriodData.status)}`}>
                        {statusDisplayMap[selectedPeriodData.status] || selectedPeriodData.status}
                    </span>
                  </p>
                  <p><span className="text-gray-500">Tiền hốt (VNĐ):</span> <span className="font-medium">{formatNumber(selectedPeriodData.amountCollected) || 'N/A'}</span></p>
                  <p className="col-span-2 md:col-span-1"><span className="text-gray-500">Người hốt hụi:</span> <span className="font-medium">{members.find(m => m.id === selectedPeriodData.huiMasterMemberId)?.user?.name || members.find(m => m.id === selectedPeriodData.huiMasterMemberId)?.name || 'Chưa xác định'}</span></p>
                  {selectedPeriodData.thamKeu && <p><span className="text-gray-500">Thăm kêu (VNĐ):</span> <span className="font-medium">{formatNumber(selectedPeriodData.thamKeu)}</span></p>}
                  {selectedPeriodData.thao && <p><span className="text-gray-500">Thảo (VNĐ):</span> <span className="font-medium">{formatNumber(selectedPeriodData.thao)}</span></p>}
                </div>
              </div>

              {/* Members Payment Table for Selected Period */}
              <div>
                <h5 className="text-md font-semibold text-gray-700 mb-3">Danh sách đóng tiền của thành viên</h5>
                <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 sm:rounded-md">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành viên</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Số tiền đóng (VNĐ)</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái đóng</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái thành viên</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPeriodData.subRows.map(subRow => {
                        const memberOverallStatus = getMemberOverallStatus(subRow.memberId, selectedPeriodData);
                        return (
                          <tr key={`sub-${selectedPeriodData.period}-${subRow.memberId}`}>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-800">{subRow.memberName}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-right">{formatNumber(subRow.amountDue)}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getStatusColor(subRow.status)}`}>
                                {statusDisplayMap[subRow.status] || subRow.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{memberOverallStatus}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500">Chọn một kỳ từ danh sách bên trái để xem chi tiết.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailedPaymentScheduleTable;
