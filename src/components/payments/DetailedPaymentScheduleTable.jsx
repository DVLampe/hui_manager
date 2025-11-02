import React, { useState, useEffect, useRef } from 'react';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';

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

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const huiInfo = [
      ['Tên Hụi', huiName],
      ['Chủ Hụi', huiGroup.manager?.name || 'N/A'],
      ['Ngày bắt đầu', formatDate(huiGroup.startDate)],
      ['Chu kỳ', huiGroup.frequency],
      ['Trạng thái hụi', huiGroup.status],
      ['Số tiền mỗi kỳ', `${formatNumber(groupBaseAmount)} VNĐ`],
      ['Số kỳ', scheduleDetails.length],
      [] // Blank row
    ];

    let allPeriodsData = [];

    scheduleDetails.forEach(period => {
      allPeriodsData.push([`Kỳ ${period.period}`]); // Main header for the period
      allPeriodsData.push(['Ngày đến hạn', period.dueDate]);
      allPeriodsData.push(['Trạng thái kỳ', statusDisplayMap[period.status] || period.status]);
      allPeriodsData.push(['Người hốt hụi', period.potTakerName]);
      allPeriodsData.push(['Tiền hốt (VNĐ)', formatNumber(period.amountCollected)]);
      allPeriodsData.push(['Thăm kêu (VNĐ)', formatNumber(period.thamKeu)]);
      allPeriodsData.push(['Thảo (VNĐ)', formatNumber(period.thao)]);
      allPeriodsData.push([]); // Spacer
      allPeriodsData.push(['Thành viên', 'Số tiền đóng (VNĐ)', 'Trạng thái thành viên']); // Sub-header

      period.subRows.forEach(subRow => {
        allPeriodsData.push([
          subRow.memberName,
          formatNumber(subRow.amountDue),
          getMemberOverallStatus(subRow.memberId, period, scheduleDetails)
        ]);
      });
      allPeriodsData.push([]); // Spacer row after each period's data
    });

    const finalData = huiInfo.concat(allPeriodsData);
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết thanh toán');
    
    XLSX.writeFile(wb, `chi-tiet-thanh-toan-${huiName}.xlsx`);
    setShowExportOptions(false);
  };

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    setShowExportOptions(false);

    // 1. Create a new, off-screen container for the export content
    const exportContainer = document.createElement('div');
    exportContainer.className = 'tailwind-styles-for-pdf'; // Use a class to scope styles if needed
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = 'auto';
    exportContainer.style.width = '1123px'; // A4 landscape-like width
    exportContainer.style.padding = '20px';
    exportContainer.style.backgroundColor = 'white';
    
    // 2. Build the HTML content for all periods
    let headerHtml = `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ccc; page-break-inside: avoid;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Thông tin Hụi: ${huiName}</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 14px;">
          <p><strong>Chủ Hụi:</strong> ${huiGroup.manager?.name || 'N/A'}</p>
          <p><strong>Ngày bắt đầu:</strong> ${formatDate(huiGroup.startDate)}</p>
          <p><strong>Chu kỳ:</strong> ${huiGroup.frequency}</p>
          <p><strong>Trạng thái hụi:</strong> ${huiGroup.status}</p>
          <p><strong>Số tiền mỗi kỳ:</strong> ${formatNumber(groupBaseAmount)} VNĐ</p>
          <p><strong>Số kỳ:</strong> ${scheduleDetails.length}</p>
        </div>
      </div>
    `;

    let periodsHtml = '';
    scheduleDetails.forEach(periodData => {
      let subRowsHtml = '';
      periodData.subRows.forEach(subRow => {
        subRowsHtml += `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px 16px; font-size: 14px;">${subRow.memberName}</td>
            <td style="padding: 8px 16px; font-size: 14px; text-align: right;">${formatNumber(subRow.amountDue)}</td>
            <td style="padding: 8px 16px; font-size: 14px;">${getMemberOverallStatus(subRow.memberId, periodData, scheduleDetails)}</td>
          </tr>
        `;
      });

      periodsHtml += `
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ccc; page-break-inside: avoid;">
          <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 4px;">Chi tiết Kỳ ${periodData.period}</h4>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 16px; font-size: 14px; margin-bottom: 16px;">
            <p><strong>Ngày đến hạn:</strong> ${periodData.dueDate}</p>
            <p><strong>Trạng thái kỳ:</strong> ${statusDisplayMap[periodData.status] || periodData.status}</p>
            <p><strong>Người hốt hụi:</strong> ${periodData.potTakerName}</p>
            <p><strong>Tiền hốt (VNĐ):</strong> ${formatNumber(periodData.amountCollected) || 'N/A'}</p>
            <p><strong>Thăm kêu (VNĐ):</strong> ${formatNumber(periodData.thamKeu)}</p>
            <p><strong>Thảo (VNĐ):</strong> ${formatNumber(periodData.thao)}</p>
          </div>
          <h5 style="font-size: 1rem; font-weight: 600; margin-bottom: 8px;">Danh sách đóng tiền của thành viên</h5>
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f9fafb;">
              <tr>
                <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; text-transform: uppercase;">Thành viên</th>
                <th style="padding: 8px 16px; text-align: right; font-size: 12px; font-weight: 500; color: #374151; text-transform: uppercase;">Số tiền đóng (VNĐ)</th>
                <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; text-transform: uppercase;">Trạng thái thành viên</th>
              </tr>
            </thead>
            <tbody>
              ${subRowsHtml}
            </tbody>
          </table>
        </div>
      `;
    });
    exportContainer.innerHTML = headerHtml + periodsHtml;
    
    // 3. Append to body, render, then remove
    document.body.appendChild(exportContainer);

    try {
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.height / imgProps.width;
      const imgHeight = pdfWidth * ratio;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`chi-tiet-thanh-toan-${huiName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // 4. Clean up
      document.body.removeChild(exportContainer);
    }
  };

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
            <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline" size="sm">Export</Button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button>
                <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button>
              </div>
            )}
          </div>
        </div>
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
                <StatusBadge status={period.status} />
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
                    <StatusBadge status={selectedPeriodData.status} />
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
