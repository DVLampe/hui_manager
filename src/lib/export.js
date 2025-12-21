// Helper function to format date as DD/MM/YYYY
const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

import { getStatusDisplayText } from '@/lib/paymentStatus';

// Helper function to format numbers with dot as thousands separator
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) {
    return '';
  }
  return parseFloat(num).toLocaleString('vi-VN');
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

export const exportDetailedScheduleToExcel = async (huiGroup) => {
    const XLSX = await import('xlsx');
    const { name: huiName, amount: groupBaseAmount, members: groupMembers, payments: groupPeriods } = huiGroup || {};

    const huiInfo = [
      ['Tên Hụi', huiName],
      ['Chủ Hụi', huiGroup.manager?.name || 'N/A'],
      ['Ngày bắt đầu', formatDate(huiGroup.startDate)],
      ['Chu kỳ', huiGroup.frequency],
      ['Trạng thái hụi', huiGroup.status],
      ['Số tiền mỗi kỳ', `${formatNumber(groupBaseAmount)} VNĐ`],
      ['Số kỳ', groupPeriods.length],
      [] // Blank row
    ];

    let allPeriodsData = [];

    groupPeriods.forEach(period => {
      allPeriodsData.push([`Kỳ ${period.period}`]);
      allPeriodsData.push(['Ngày đến hạn', formatDate(period.dueDate)]);
      allPeriodsData.push(['Trạng thái kỳ', getStatusDisplayText(period.transactionStatus)]);
      allPeriodsData.push(['Người hốt hụi', period.potTakerMember?.user?.name || period.potTakerMember?.guestName || 'Chưa xác định']);
      allPeriodsData.push(['Tiền hốt (VNĐ)', formatNumber(period.amountCollected)]);
      allPeriodsData.push(['Thăm kêu (VNĐ)', formatNumber(period.thamKeu)]);
      allPeriodsData.push(['Thảo (VNĐ)', formatNumber(period.thao)]);
      allPeriodsData.push([]);
      allPeriodsData.push(['Thành viên', 'Số tiền đóng', 'Trạng thái thành viên']);

      groupMembers.forEach(member => {
        const isPotTakerThisPeriod = member.id === period.potTakerMemberId;
        const hasTakenPotPreviously = groupPeriods.some(p => p.period < period.period && p.potTakerMemberId === member.id && p.status === 'DA_THANH_TOAN');
        
        // First check if there's an actual contribution record
        const contributionRecord = period.memberContributions?.find(c => c.memberId === member.id);
        
        let individualPaymentAmount = null;
        if (contributionRecord) {
          // Use actual contributed amount from database
          individualPaymentAmount = parseFloat(contributionRecord.amountContributed);
        } else if (period.transactionStatus === 'DA_THANH_TOAN' || period.transactionStatus === 'CHO_THANH_TOAN') {
          // Fall back to calculated amount if no contribution record exists
          if (isPotTakerThisPeriod) {
            individualPaymentAmount = 0;
          } else if (hasTakenPotPreviously) {
            individualPaymentAmount = parseFloat(period.amount || groupBaseAmount);
          } else {
            individualPaymentAmount = parseFloat(period.amount || groupBaseAmount) - (parseFloat(period.thamKeu) || 0);
          }
        }
        allPeriodsData.push([
          member.user?.name || member.guestName,
          formatNumber(individualPaymentAmount),
          getMemberOverallStatus(member.id, period, groupPeriods)
        ]);
      });
      allPeriodsData.push([]);
    });

    const finalData = huiInfo.concat(allPeriodsData);
    const ws = XLSX.utils.aoa_to_sheet(finalData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Chi tiết thanh toán');
    
    XLSX.writeFile(wb, `chi-tiet-thanh-toan-${huiName}.xlsx`);
};

export const exportDetailedScheduleToPDF = async (huiGroup) => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    const { name: huiName, amount: groupBaseAmount, members: groupMembers, payments: groupPeriods } = huiGroup || {};

    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = 'auto';
    exportContainer.style.width = '1123px';
    exportContainer.style.padding = '20px';
    exportContainer.style.backgroundColor = 'white';
    
    let headerHtml = `
      <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ccc; page-break-inside: avoid;">
        <h2 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem;">Thông tin Hụi: ${huiName}</h2>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; font-size: 14px;">
          <p><strong>Chủ Hụi:</strong> ${huiGroup.manager?.name || 'N/A'}</p>
          <p><strong>Ngày bắt đầu:</strong> ${formatDate(huiGroup.startDate)}</p>
          <p><strong>Chu kỳ:</strong> ${huiGroup.frequency}</p>
          <p><strong>Trạng thái hụi:</strong> ${huiGroup.status}</p>
          <p><strong>Số tiền mỗi kỳ:</strong> ${formatNumber(groupBaseAmount)} VNĐ</p>
          <p><strong>Số kỳ:</strong> ${groupPeriods.length}</p>
        </div>
      </div>
    `;

    let periodsHtml = '';
    groupPeriods.forEach(period => {
      let subRowsHtml = '';
      groupMembers.forEach(member => {
        const isPotTakerThisPeriod = member.id === period.potTakerMemberId;
        const hasTakenPotPreviously = groupPeriods.some(p => p.period < period.period && p.potTakerMemberId === member.id && p.transactionStatus === 'DA_THANH_TOAN');
        
        // First check if there's an actual contribution record
        const contributionRecord = period.memberContributions?.find(c => c.memberId === member.id);
        
        let individualPaymentAmount = null;
        if (contributionRecord) {
          // Use actual contributed amount from database
          individualPaymentAmount = parseFloat(contributionRecord.amountContributed);
        } else if (period.transactionStatus === 'DA_THANH_TOAN' || period.transactionStatus === 'CHO_THANH_TOAN') {
          // Fall back to calculated amount if no contribution record exists
          if (isPotTakerThisPeriod) {
            individualPaymentAmount = 0;
          } else if (hasTakenPotPreviously) {
            individualPaymentAmount = parseFloat(period.amount || groupBaseAmount);
          } else {
            individualPaymentAmount = parseFloat(period.amount || groupBaseAmount) - (parseFloat(period.thamKeu) || 0);
          }
        }
        subRowsHtml += `
          <tr style="border-top: 1px solid #e5e7eb;">
            <td style="padding: 8px 16px; font-size: 14px;">${member.user?.name || member.guestName}</td>
            <td style="padding: 8px 16px; font-size: 14px; text-align: right;">${formatNumber(individualPaymentAmount)}</td>
            <td style="padding: 8px 16px; font-size: 14px;">${getMemberOverallStatus(member.id, period, groupPeriods)}</td>
          </tr>
        `;
      });

      periodsHtml += `
        <div style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #ccc; page-break-inside: avoid;">
          <h4 style="font-size: 1.125rem; font-weight: 600; margin-bottom: 4px;">Chi tiết Kỳ ${period.period}</h4>
          <div style="display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 4px 16px; font-size: 14px; margin-bottom: 16px;">
            <p><strong>Ngày đến hạn:</strong> ${formatDate(period.dueDate)}</p>
            <p><strong>Trạng thái kỳ:</strong> ${getStatusDisplayText(period.transactionStatus)}</p>
            <p><strong>Người hốt hụi:</strong> ${period.potTakerMember?.user?.name || period.potTakerMember?.guestName || 'Chưa xác định'}</p>
            <p><strong>Tiền hốt (VNĐ):</strong> ${formatNumber(period.amountCollected) || 'N/A'}</p>
            <p><strong>Thăm kêu (VNĐ):</strong> ${formatNumber(period.thamKeu)}</p>
            <p><strong>Thảo (VNĐ):</strong> ${formatNumber(period.thao)}</p>
          </div>
          <h5 style="font-size: 1rem; font-weight: 600; margin-bottom: 8px;">Danh sách đóng tiền của thành viên</h5>
          <table style="width: 100%; border-collapse: collapse;">
            <thead style="background-color: #f9fafb;">
              <tr>
                <th style="padding: 8px 16px; text-align: left; font-size: 12px; font-weight: 500; color: #374151; text-transform: uppercase;">Thành viên</th>
                <th style="padding: 8px 16px; text-align: right; font-size: 12px; font-weight: 500; color: #374151; text-transform: uppercase;">Số tiền đóng</th>
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
      document.body.removeChild(exportContainer);
    }
};
