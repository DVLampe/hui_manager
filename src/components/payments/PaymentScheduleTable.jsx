import React, { useState, useRef } from 'react';
import Button from '@/components/ui/Button';
import NumberInput from '@/components/ui/NumberInput';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatNumber } from '@/lib/utils';
import { Download, ChevronDown } from 'lucide-react';

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

const PaymentScheduleTable = ({ huiGroup, currentDateString, onSaveChanges, disabled = false }) => {
  if (!huiGroup || !huiGroup.startDate) {
    return <p className="text-gray-600">Chưa có thông tin hụi đầy đủ để hiển thị lịch thanh toán.</p>;
  }

  const [isEditing, setIsEditing] = useState(false);
  const [editableSchedule, setEditableSchedule] = useState([]);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const tableRef = useRef(null);

  const numberOfPeriods = huiGroup.numberOfPeriods || huiGroup.totalMembers || 12;
  const { amount, startDate, name: huiName, frequency } = huiGroup;

  React.useEffect(() => {
    const today = new Date(currentDateString);
    today.setHours(0, 0, 0, 0);
    const initialStartDate = new Date(startDate);
    initialStartDate.setHours(0,0,0,0);

    const generatedSchedule = [];
    for (let i = 0; i < numberOfPeriods; i++) {
      const dueDate = new Date(initialStartDate);
      if (frequency === 'DAILY') {
        dueDate.setDate(dueDate.getDate() + i);
      } else if (frequency === 'WEEKLY') {
        dueDate.setDate(dueDate.getDate() + i * 7);
      } else { // MONTHLY
        dueDate.setMonth(dueDate.getMonth() + i);
      }
      
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
        thanhVienHotHui: paymentForPeriod?.potTakerMemberId || '',
        tienHot: paymentForPeriod?.amountCollected?.toLocaleString('vi-VN') || '',
        status: paymentForPeriod?.transactionStatus || initialDisplayStatus,
        originalAmount: parseFloat(amount).toLocaleString('vi-VN'),
        originalStatus: paymentForPeriod?.transactionStatus || initialDisplayStatus,
        thamKeu: paymentForPeriod?.thamKeu || '',
        thao: paymentForPeriod?.thao || '',
      });
    }
    setEditableSchedule(generatedSchedule);
  }, [huiGroup, currentDateString, numberOfPeriods, amount, startDate, frequency]);

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (isEditing) { // When toggling from editing to not-editing (Cancel)
        const today = new Date(currentDateString);
        today.setHours(0, 0, 0, 0);
        const initialStartDate = new Date(startDate);
        initialStartDate.setHours(0,0,0,0);

        const resetSchedule = [];
        for (let i = 0; i < numberOfPeriods; i++) {
          const dueDate = new Date(initialStartDate);
          if (frequency === 'DAILY') {
            dueDate.setDate(dueDate.getDate() + i);
          } else if (frequency === 'WEEKLY') {
            dueDate.setDate(dueDate.getDate() + i * 7);
          } else { // MONTHLY
            dueDate.setMonth(dueDate.getMonth() + i);
          }

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
            thanhVienHotHui: paymentForPeriod?.potTakerMemberId || '',
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
        memberId: item.thanhVienHotHui, // This will now correctly carry the potTakerMemberId
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

  const handleExportPDF = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: html2canvas } = await import('html2canvas');
    setShowExportOptions(false);
    const tableElement = tableRef.current;
    if (!tableElement) return;

    // Create a container for the export content
    const exportContainer = document.createElement('div');
    exportContainer.style.position = 'absolute';
    exportContainer.style.left = '-9999px';
    exportContainer.style.top = 'auto';
    exportContainer.style.width = '1123px'; // A4 landscape width in pixels approx
    exportContainer.style.padding = '20px';
    exportContainer.style.backgroundColor = 'white';
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = `
      <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 16px;">Thông tin Hụi: ${huiName}</h1>
      <div style="font-size: 14px; margin-bottom: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
        <p><strong>Chủ Hụi:</strong> ${huiGroup.manager?.name || 'N/A'}</p>
        <p><strong>Ngày bắt đầu:</strong> ${formatDate(startDate)}</p>
        <p><strong>Số kỳ:</strong> ${numberOfPeriods}</p>
        <p><strong>Chu kỳ:</strong> ${frequency}</p>
        <p><strong>Trạng thái hụi:</strong> ${huiGroup.status}</p>
        <p><strong>Số tiền mỗi kỳ:</strong> ${parseFloat(amount).toLocaleString('vi-VN')} VNĐ</p>
      </div>
    `;
    
    // Clone table
    const tableClone = tableElement.cloneNode(true);
    
    // Append to container
    exportContainer.appendChild(header);
    exportContainer.appendChild(tableClone);
    
    // Append container to body to be rendered
    document.body.appendChild(exportContainer);

    try {
      const canvas = await html2canvas(exportContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4'); // landscape
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.height / imgProps.width;
      let imgHeight = pdfWidth * ratio;

      if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
      }

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
      pdf.save(`lich-thanh-toan-${huiName}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      // Clean up
      document.body.removeChild(exportContainer);
    }
  };

  const handleExportExcel = async () => {
    const XLSX = await import('xlsx');
    const huiInfo = [
      { A: 'Tên Hụi', B: huiName },
      { A: 'Chủ Hụi', B: huiGroup.manager?.name || 'N/A' },
      { A: 'Ngày bắt đầu', B: formatDate(startDate) },
      { A: 'Số kỳ', B: numberOfPeriods },
      { A: 'Chu kỳ', B: frequency },
      { A: 'Trạng thái hụi', B: huiGroup.status },
      { A: 'Số tiền mỗi kỳ', B: `${parseFloat(amount).toLocaleString('vi-VN')} VNĐ` },
    ];

    const scheduleData = editableSchedule.map(item => ({
      'Kỳ': item.period,
      'Ngày đến hạn': item.dueDate,
      'Thành viên hốt hụi': members.find(m => m.id === item.thanhVienHotHui)?.user?.name || members.find(m => m.id === item.thanhVienHotHui)?.guestName || 'N/A',
      'Thăm kêu': item.thamKeu,
      'Thảo': item.thao,
      'Tiền hốt (VNĐ)': item.tienHot,
      'Trạng thái': statusDisplayMap[item.status] || item.status,
    }));

    const huiInfoSheet = XLSX.utils.json_to_sheet(huiInfo, { header: ["A", "B"], skipHeader: true });
    const scheduleSheet = XLSX.utils.json_to_sheet(scheduleData);

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, huiInfoSheet, 'LichThanhToan');
    XLSX.utils.sheet_add_json(workbook.Sheets['LichThanhToan'], [{}], { origin: -1, skipHeader: true }); // Add a blank row
    XLSX.utils.sheet_add_json(workbook.Sheets['LichThanhToan'], scheduleData, { origin: -1, skipHeader: false });

    XLSX.writeFile(workbook, `lich-thanh-toan-${huiName}.xlsx`);
    setShowExportOptions(false);
  };

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
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <button onClick={handleSaveChanges} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium text-sm">Lưu thay đổi</button>
                  <button onClick={handleEditToggle} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm">Hủy</button>
                </>
              ) : (
                !disabled && <button onClick={handleEditToggle} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">Chỉnh sửa</button>
              )}
              <div className="relative">
                <button onClick={() => setShowExportOptions(!showExportOptions)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Export</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                {showExportOptions && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                        <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button>
                        <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button>
                    </div>
                )}
              </div>
            </div>
        </div>
      </div>


      <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
        <div className="overflow-x-auto" ref={tableRef}>
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Kỳ</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày đến hạn</th>
                {/* <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số tiền kỳ (VNĐ)</th> */}
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thành viên hốt hụi</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thăm kêu</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Thảo</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tiền hốt (VNĐ)</th>
                <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {editableSchedule.map((item) => (
                <tr key={item.period}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">{item.period}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.dueDate}</td>
                  {/*
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
                  */}
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <select
                        value={item.thanhVienHotHui}
                        onChange={(e) => handleInputChange(item.period, 'thanhVienHotHui', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      >
                        <option value="">Chọn thành viên</option>
                        {members.map(member => (
                          <option key={member.id || member.userId} value={member.id || member.userId}>
                            {member.user?.name || member.guestName || member.name || member.userId}
                          </option>
                        ))}
                      </select>
                    ) : (
                      members.find(m => (m.id || m.userId) === item.thanhVienHotHui)?.user?.name ||
                      members.find(m => (m.id || m.userId) === item.thanhVienHotHui)?.guestName ||
                      members.find(m => (m.id || m.userId) === item.thanhVienHotHui)?.name ||
                      item.thanhVienHotHui || 'N/A'
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <NumberInput
                        value={item.thamKeu}
                        onChange={(e) => handleInputChange(item.period, 'thamKeu', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      formatNumber(item.thamKeu)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {isEditing ? (
                      <NumberInput
                        value={item.thao}
                        onChange={(e) => handleInputChange(item.period, 'thao', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md"
                      />
                    ) : (
                      formatNumber(item.thao)
                    )}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 text-right">
                    {isEditing ? (
                      <NumberInput
                        value={item.tienHot}
                        onChange={(e) => handleInputChange(item.period, 'tienHot', e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded-md text-right"
                      />
                    ) : (
                      formatNumber(item.tienHot)
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
                      statusDisplayMap[item.status] || item.status
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
