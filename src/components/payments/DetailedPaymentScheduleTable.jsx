import React, { useState, useEffect } from 'react';

// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date'; // Handle invalid date strings
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Helper function to format numbers with dot as thousands separator
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) {
    return ''; // Or return '0' or 'N/A' based on preference
  }
  return parseFloat(num).toLocaleString('vi-VN');
};

const DetailedPaymentScheduleTable = ({ huiGroup, currentDateString }) => {
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);

  // huiGroup.amount is the base contribution amount for the group
  const { name: huiName, amount: groupBaseAmount, members: groupMembers, payments: groupPeriods } = huiGroup || {};

  useEffect(() => {
    if (!huiGroup || !groupBaseAmount || !groupMembers || !groupMembers.length || !groupPeriods) {
      setScheduleDetails([]);
      return;
    }

    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);

    const generatedScheduleDetails = groupPeriods.map(periodPayment => {
      const rawDueDate = new Date(periodPayment.dueDate);
      rawDueDate.setHours(0,0,0,0);

      // Determine overall period status if not directly provided or needs adjustment
      // The API now provides transactionStatus on the payment (period) object directly
      let calculatedPeriodStatus = periodPayment.transactionStatus || 'CHUA_DEN_KY';
      if (calculatedPeriodStatus === 'CHO_THANH_TOAN' && rawDueDate > today) {
        // This logic might be too simplistic, API should be source of truth for CHUA_DEN_KY
        // calculatedPeriodStatus = 'CHUA_DEN_KY'; 
      }
      // If period is paid, but due date is in future (e.g. pre-paid), it's still DA_THANH_TOAN

      const periodDetail = {
        id: periodPayment.id, // ID of the Payment record (period)
        period: periodPayment.period, // Kỳ number
        dueDate: formatDate(periodPayment.dueDate),
        rawDueDate: rawDueDate,
        potTakerMemberId: periodPayment.potTakerMemberId, // HuiMember.id of the pot taker
        potTakerName: periodPayment.potTakerMember?.user?.name || 'Chưa xác định',
        amountCollected: periodPayment.amountCollected, // Total amount for the pot taker
        status: calculatedPeriodStatus, // Overall status of the period (PaymentStatus enum)
        thamKeu: periodPayment.thamKeu,
        thao: periodPayment.thao,
        memberContributions: periodPayment.memberContributions || [], // Array of MemberPeriodContribution
        subRows: [], // This will be populated below
      };

      const baseAmountForPeriod = parseFloat(periodPayment.amount || groupBaseAmount); // Use period specific amount or group default

      groupMembers.forEach(member => {
        const isPotTakerThisPeriod = member.id === periodDetail.potTakerMemberId;
        const contributionRecord = periodDetail.memberContributions.find(c => c.memberId === member.id);

        let individualPaymentAmount = baseAmountForPeriod;
        let memberContributionStatus = 'CHUA_DONG'; // Default if no record and not pot taker

        if (contributionRecord) {
          individualPaymentAmount = parseFloat(contributionRecord.amountContributed);
          memberContributionStatus = contributionRecord.status;
        } else {
          // If no specific contribution record, derive status and amount
          if (periodDetail.status === 'DA_THANH_TOAN') {
            if (isPotTakerThisPeriod) {
              memberContributionStatus = 'MIEN_DONG'; // Or HOT_HUI from old system if that's preferred
              individualPaymentAmount = 0;
            } else {
              // If period is DA_THANH_TOAN, non-takers without a record are assumed DA_DONG
              // with amount based on thamKeu if available for the period
              memberContributionStatus = 'DA_DONG'; 
              if (periodDetail.thamKeu && parseFloat(periodDetail.thamKeu) > 0) {
                individualPaymentAmount = parseFloat(periodDetail.thamKeu);
              } else {
                individualPaymentAmount = baseAmountForPeriod; // Fallback to base if no thamkeu
              }
            }
          } else if (periodDetail.status === 'CHO_THANH_TOAN') {
            if (isPotTakerThisPeriod) {
              memberContributionStatus = 'MIEN_DONG'; // Pot taker doesn't pay themselves
              individualPaymentAmount = 0;
            } else {
              memberContributionStatus = 'CHUA_DONG';
              individualPaymentAmount = baseAmountForPeriod;
            }
          } else if (periodDetail.status === 'CHUA_DEN_KY') {
            memberContributionStatus = 'CHUA_DEN_KY';
             if (isPotTakerThisPeriod) {
              // Even if CHUA_DEN_KY, if they are designated pot taker, amount is 0
              individualPaymentAmount = 0;
            }
          }
        }
        
        // Override for pot taker if MIEN_DONG is not set by contributionRecord.status
        if (isPotTakerThisPeriod && memberContributionStatus !== 'MIEN_DONG') {
            // memberContributionStatus = 'MIEN_DONG'; // Assuming pot taker is exempt
            individualPaymentAmount = 0; 
        }


        periodDetail.subRows.push({
          contributionId: contributionRecord?.id || null,
          memberId: member.id,
          memberName: member.user?.name || `Member ${member.id}`,
          amountDue: individualPaymentAmount,
          status: memberContributionStatus, // MemberContributionStatus enum
        });
      });

      return periodDetail;
    });

    setScheduleDetails(generatedScheduleDetails);

    // Auto-select current or first period
    let currentPeriodIndex = generatedScheduleDetails.findIndex(p => p.rawDueDate >= today && p.status !== 'DA_THANH_TOAN');
    if (currentPeriodIndex === -1) { // if all past or paid, find first non-paid or just first
        currentPeriodIndex = generatedScheduleDetails.findIndex(p => p.status === 'CHO_THANH_TOAN');
    }
    if (currentPeriodIndex === -1) { // if all paid, select last, or if all chua_den_ky, select first
        currentPeriodIndex = generatedScheduleDetails.length > 0 ? Math.min(generatedScheduleDetails.findIndex(p=>p.rawDueDate >= today), generatedScheduleDetails.length -1 ) : 0;
    }
     if (currentPeriodIndex === -1 && generatedScheduleDetails.length > 0) currentPeriodIndex = 0;

    setSelectedPeriodIndex(currentPeriodIndex >= 0 ? currentPeriodIndex : 0);

  }, [huiGroup, currentDateString, groupBaseAmount, groupMembers, groupPeriods]);

  const statusDisplayMap = {
    // PaymentStatus (Overall Period Status)
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
    // MemberContributionStatus (Individual Member's Contribution Status)
    CHUA_DONG: 'Chưa đóng',
    DA_DONG: 'Đã đóng',
    MIEN_DONG: 'Miễn đóng (Hốt)',
    TRE_HAN: 'Trễ hạn',
    CHO_XAC_NHAN: 'Chờ xác nhận',
    // Old statuses for compatibility if needed, map them or remove
    HOT_HUI: 'Đã hốt hụi', // Covered by MIEN_DONG + period status DA_THANH_TOAN for pot taker
    DUOC_HOT: 'Đến lượt hốt', // Pot taker for current CHO_THANH_TOAN period
    DUOC_HOT_SAU: 'Sẽ hốt kỳ này', // Pot taker for CHUA_DEN_KY period
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DA_THANH_TOAN': // Period status
      case 'DA_DONG': // Member contribution status
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'CHO_THANH_TOAN': // Period status
      case 'CHO_XAC_NHAN': // Member contribution status
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'HUY': // Period status
      case 'TRE_HAN': // Member contribution status
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'MIEN_DONG': // Member contribution status (pot taker)
      // Explicitly for pot-taker related visual cues from old system
      case 'HOT_HUI': 
      case 'DUOC_HOT':
      case 'DUOC_HOT_SAU':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'CHUA_DEN_KY': // Period status & Member contribution status
      case 'CHUA_DONG': // Member contribution status
      default:
        return 'bg-gray-100 text-gray-600 ring-gray-500/10';
    }
  };
  
  // Determines the overall status of a member within the Hui context for the selected period
  const getMemberOverallStatus = (memberId, currentPeriodData, allPeriods) => {
    if (!currentPeriodData || !allPeriods || allPeriods.length === 0) return 'N/A';

    if (memberId === currentPeriodData.potTakerMemberId) {
      if (currentPeriodData.status === 'DA_THANH_TOAN') return 'Hốt hụi (Đã nhận)';
      if (currentPeriodData.status === 'CHO_THANH_TOAN') return 'Hốt hụi (Đến lượt)';
      return 'Hốt hụi (Sẽ hốt)'; // CHUA_DEN_KY or other
    }

    // Check if member has taken the pot in any previous *settled* period
    for (let i = 0; i < currentPeriodData.period - 1; i++) {
      const pastPeriod = allPeriods.find(p => p.period === (i + 1));
      if (pastPeriod && pastPeriod.potTakerMemberId === memberId && pastPeriod.status === 'DA_THANH_TOAN') {
        return 'Hụi chết (Đã hốt)';
      }
    }
    return 'Hụi sống (Chưa hốt)';
  };

  if (!huiGroup || !groupPeriods || groupPeriods.length === 0) {
    return <p className="text-center text-gray-600 py-10">Chưa có thông tin kỳ thanh toán cho hụi này hoặc hụi không đầy đủ.</p>;
  }

  if (scheduleDetails.length === 0) {
     // This might briefly show if huiGroup is present but scheduleDetails isn't populated yet by useEffect.
     // Consider a more specific loading state if huiGroup is present but processing is ongoing.
    return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu chi tiết...</p>;
  }

  const selectedPeriodData = scheduleDetails[selectedPeriodIndex];

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-xl font-semibold leading-6 text-gray-900">
          Lịch thanh toán chi tiết: {huiName}
        </h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Tổng số kỳ: {scheduleDetails.length}, Số tiền gốc mỗi kỳ: {formatNumber(groupBaseAmount)} VNĐ
        </p>
      </div>

      <div className="flex min-h-[600px]">
        <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
          <nav className="p-2 space-y-1">
            {scheduleDetails.map((period, index) => (
              <button
                key={`period-nav-${period.id || period.period}`}
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
                                ${getStatusColor(period.status).replace('bg-', 'bg-opacity-20 bg-')}
                                ${selectedPeriodIndex === index ? '' : 'opacity-80'}`}>
                  {statusDisplayMap[period.status] || period.status}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="w-3/4 p-6 overflow-y-auto">
          {selectedPeriodData ? (
            <>
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
                  <p className="col-span-2 md:col-span-1"><span className="text-gray-500">Người hốt hụi:</span> <span className="font-medium">{selectedPeriodData.potTakerName}</span></p>
                  {selectedPeriodData.thamKeu !== null && selectedPeriodData.thamKeu !== undefined && <p><span className="text-gray-500">Thăm kêu (VNĐ):</span> <span className="font-medium">{formatNumber(selectedPeriodData.thamKeu)}</span></p>}
                  {selectedPeriodData.thao !== null && selectedPeriodData.thao !== undefined && <p><span className="text-gray-500">Thảo (VNĐ):</span> <span className="font-medium">{formatNumber(selectedPeriodData.thao)}</span></p>}
                </div>
              </div>

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
                        const memberOverallStatus = getMemberOverallStatus(subRow.memberId, selectedPeriodData, scheduleDetails);
                        return (
                          <tr key={`sub-${selectedPeriodData.id || selectedPeriodData.period}-${subRow.memberId}-${subRow.contributionId || 'no-contrib'}`}>
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
