import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { t } from '@/lib/translations';
import { formatDate, formatNumber } from '@/lib/utils';
import { CheckCircle, Download, ChevronDown } from 'lucide-react';
import { exportDetailedScheduleToExcel, exportDetailedScheduleToPDF } from '@/lib/export';

const DetailedPaymentScheduleTable = ({ huiGroup, currentDateString }) => {
  const [scheduleDetails, setScheduleDetails] = useState([]);
  const [selectedPeriodIndex, setSelectedPeriodIndex] = useState(0);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const exportContentRef = useRef(null);

  // huiGroup.amount is the base contribution amount for the group
  const { name: huiName, amount: groupBaseAmount, members: groupMembers, payments: groupPeriods } = huiGroup || {};

  useEffect(() => {
    if (!huiGroup || !groupBaseAmount || !groupMembers || !groupMembers.length || !groupPeriods) {
      setScheduleDetails([]);
      return;
    }

    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);

    // Pre-calculate the set of members who have taken the pot in settled periods for efficient lookup.
    const membersWhoHaveTakenPot = new Set();
    [...groupPeriods]
      .sort((a, b) => a.period - b.period)
      .forEach(p => {
        if (p.status === 'DA_THANH_TOAN' && p.potTakerMemberId) {
            membersWhoHaveTakenPot.add(p.potTakerMemberId);
        }
      });

    const generatedScheduleDetails = groupPeriods.map(periodPayment => {
      const rawDueDate = new Date(periodPayment.dueDate);
      rawDueDate.setHours(0,0,0,0);

      const periodDetail = {
        id: periodPayment.id,
        period: periodPayment.period,
        dueDate: formatDate(periodPayment.dueDate),
        rawDueDate: rawDueDate,
        potTakerMemberId: periodPayment.potTakerMemberId,
        potTakerName: periodPayment.potTakerMember?.user?.name || periodPayment.potTakerMember?.guestName || 'Chưa xác định',
        amountCollected: periodPayment.amountCollected,
        status: periodPayment.transactionStatus || 'CHUA_DEN_KY',
        thamKeu: periodPayment.thamKeu,
        thao: periodPayment.thao,
        memberContributions: periodPayment.memberContributions || [],
        subRows: [],
      };

      const baseAmountForPeriod = parseFloat(periodPayment.amount || groupBaseAmount);
      const thamKeuAmount = parseFloat(periodPayment.thamKeu) || 0;

      // Keep track of members who have taken the pot up to the period *before* the current one.
      const membersWhoTookPotBeforeThisPeriod = new Set();
       groupPeriods.forEach(p => {
        if (p.period < periodDetail.period && p.status === 'DA_THANH_TOAN' && p.potTakerMemberId) {
            membersWhoTookPotBeforeThisPeriod.add(p.potTakerMemberId);
        }
      });

      groupMembers.forEach(member => {
        const isPotTakerThisPeriod = member.id === periodDetail.potTakerMemberId;
        const hasTakenPotPreviously = membersWhoTookPotBeforeThisPeriod.has(member.id);
        const contributionRecord = periodDetail.memberContributions.find(c => c.memberId === member.id);

        let individualPaymentAmount = null;
        if (contributionRecord) {
          individualPaymentAmount = parseFloat(contributionRecord.amountContributed);
        } else if (periodDetail.status === 'DA_THANH_TOAN' || periodDetail.status === 'CHO_THANH_TOAN') {
          if (isPotTakerThisPeriod) {
            individualPaymentAmount = 0;
          } else if (hasTakenPotPreviously) {
            individualPaymentAmount = baseAmountForPeriod;
          } else {
            individualPaymentAmount = baseAmountForPeriod - thamKeuAmount;
          }
        }

        periodDetail.subRows.push({
          contributionId: contributionRecord?.id || null,
          memberId: member.id,
          memberName: member.user?.name || member.guestName || `Member ${member.id}`,
          amountDue: individualPaymentAmount,
        });
      });

      return periodDetail;
    });

    setScheduleDetails(generatedScheduleDetails);

    // Auto-select the most relevant period
    let currentPeriodIndex = generatedScheduleDetails.findIndex(p => p.rawDueDate >= today && p.status !== 'DA_THANH_TOAN');
    if (currentPeriodIndex === -1) {
        currentPeriodIndex = generatedScheduleDetails.findIndex(p => p.status === 'CHO_THANH_TOAN');
    }
    if (currentPeriodIndex === -1 && generatedScheduleDetails.length > 0) {
        currentPeriodIndex = generatedScheduleDetails.length - 1; // Fallback to last if all paid
    }
    setSelectedPeriodIndex(currentPeriodIndex >= 0 ? currentPeriodIndex : 0);

  }, [huiGroup, currentDateString, groupBaseAmount, groupMembers, groupPeriods]);

  const statusDisplayMap = {
    CHUA_DEN_KY: 'Chưa đến kỳ',
    CHO_THANH_TOAN: 'Chờ thanh toán',
    DA_THANH_TOAN: 'Đã thanh toán',
    HUY: 'Hủy',
    CHUA_DONG: 'Chưa đóng',
    DA_DONG: 'Đã đóng',
    MIEN_DONG: 'Miễn đóng (Hốt)',
    TRE_HAN: 'Trễ hạn',
    CHO_XAC_NHAN: 'Chờ xác nhận',
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DA_THANH_TOAN':
      case 'DA_DONG':
        return 'bg-green-100 text-green-700 ring-green-600/20';
      case 'CHO_THANH_TOAN':
      case 'CHO_XAC_NHAN':
        return 'bg-yellow-100 text-yellow-800 ring-yellow-600/20';
      case 'HUY':
      case 'TRE_HAN':
        return 'bg-red-100 text-red-700 ring-red-600/20';
      case 'MIEN_DONG':
        return 'bg-blue-100 text-blue-700 ring-blue-600/20';
      case 'CHUA_DEN_KY':
      case 'CHUA_DONG':
      default:
        return 'bg-gray-100 text-gray-600 ring-gray-500/10';
    }
  };

  const getMemberOverallStatus = (memberId, currentPeriodData, allPeriodsData) => {
    if (!currentPeriodData || !allPeriodsData || allPeriodsData.length === 0) return 'N/A';

    if (memberId === currentPeriodData.potTakerMemberId) {
      if (currentPeriodData.status === 'DA_THANH_TOAN') return 'Hốt hụi (Đã nhận)';
      if (currentPeriodData.status === 'CHO_THANH_TOAN') return 'Hốt hụi (Đến lượt)';
      return 'Hốt hụi (Sẽ hốt)';
    }

    const hasTakenPotPreviously = allPeriodsData.some(p =>
        p.period < currentPeriodData.period &&
        p.potTakerMemberId === memberId &&
        p.status === 'DA_THANH_TOAN'
    );

    if (hasTakenPotPreviously) {
        return 'Hụi chết (Đã hốt)';
    }

    return 'Hụi sống (Chưa hốt)';
  };

  if (!huiGroup || !groupPeriods || groupPeriods.length === 0) {
    return <p className="text-center text-gray-600 py-10">Chưa có thông tin kỳ thanh toán cho hụi này.</p>;
  }

  if (scheduleDetails.length === 0) {
    return <p className="text-center text-gray-500 py-10">Đang tải dữ liệu chi tiết...</p>;
  }

  const selectedPeriodData = scheduleDetails[selectedPeriodIndex];

  return (
    <div className="mt-8 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-semibold leading-6 text-gray-900">
              Lịch thanh toán chi tiết: {huiName}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Tổng số kỳ: {scheduleDetails.length}, Số tiền gốc mỗi kỳ: {formatNumber(groupBaseAmount)} VNĐ
            </p>
          </div>
          <div className="relative">
            <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              <span className="text-sm font-medium">Export</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            {showExportOptions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                    <button onClick={() => { exportDetailedScheduleToPDF(huiGroup); setShowExportOptions(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button>
                    <button onClick={() => { exportDetailedScheduleToExcel(huiGroup); setShowExportOptions(false); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button>
                </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex min-h-[600px]">
        <div className="w-48 flex-shrink-0">
          <h3 className="text-sm font-bold text-gray-800 mb-3">Chọn kỳ</h3>
          <div className="space-y-2">
            {scheduleDetails.map((p, index) => (
              <button
                key={p.period}
                onClick={() => setSelectedPeriodIndex(index)}
                className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                  selectedPeriodIndex === index
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">Kỳ {p.period}</span>
                  {p.status === 'DA_THANH_TOAN' && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <span className="text-xs opacity-75">{p.dueDate}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="w-3/4 p-6 overflow-y-auto">
          {selectedPeriodData ? (
            <>
              <div className="mb-6 pb-4 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-1">Chi tiết Kỳ {selectedPeriodData.period}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1 text-sm">
                  <p><span className="text-gray-500">Ngày đến hạn:</span> <span className="font-medium">{selectedPeriodData.dueDate}</span></p>
                  <p><span className="text-gray-500">Trạng thái kỳ:</span>
                    {t(selectedPeriodData.status)}
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
