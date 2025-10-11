import { useState, useRef } from 'react';
import { formatVietnameseCurrency } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';

export function HuiList({ huis, type = 'participating' }) {
    const router = useRouter();
    const [showExportOptions, setShowExportOptions] = useState(false);
    const tableRef = useRef(null);

    const handleRowClick = (huiId) => {
        router.push(`/hui/${huiId}`);
    };

    const title = type === 'owned' ? 'Hụi làm chủ' : 'Hụi tham gia';

    const handleExportExcel = () => {
        const dataToExport = huis.map(hui => ({
            'Tên hụi': hui.name,
            'Trạng thái': hui.status,
            'Số tiền': formatVietnameseCurrency(hui.amount),
            'Số kỳ': hui.ky,
            'Chu kỳ': hui.frequency,
            'Ngày bắt đầu': new Date(hui.startDate).toLocaleDateString(),
            'Ngày kết thúc': new Date(hui.endDate).toLocaleDateString(),
            [type === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ']: formatVietnameseCurrency(type === 'owned' ? hui.totalThao : hui.profit),
        }));

        const ws = XLSX.utils.json_to_sheet(dataToExport);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, title);
        XLSX.writeFile(wb, `${title}.xlsx`);
        setShowExportOptions(false);
    };

    const handleExportPDF = async () => {
        setShowExportOptions(false);
        const table = tableRef.current;
        if (!table) return;

        const exportContainer = document.createElement('div');
        exportContainer.style.position = 'absolute';
        exportContainer.style.left = '-9999px';
        exportContainer.style.top = 'auto';
        exportContainer.style.width = '1123px';
        exportContainer.style.padding = '20px';
        exportContainer.style.backgroundColor = 'white';

        const header = document.createElement('h2');
        header.textContent = title;
        header.style.fontSize = '1.5rem';
        header.style.fontWeight = '600';
        header.style.marginBottom = '1rem';
        
        const tableClone = table.cloneNode(true);
        
        exportContainer.appendChild(header);
        exportContainer.appendChild(tableClone);
        document.body.appendChild(exportContainer);

        try {
            const canvas = await html2canvas(exportContainer, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('l', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const ratio = imgProps.height / imgProps.width;
            let imgHeight = pdfWidth * ratio;
            if (imgHeight > pdfHeight) {
                imgHeight = pdfHeight;
            }
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
            pdf.save(`${title}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
        } finally {
            document.body.removeChild(exportContainer);
        }
    };

    return (
        <div className="bg-white shadow sm:rounded-md">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">{title}</h2>
                <div className="relative">
                    <Button onClick={() => setShowExportOptions(!showExportOptions)} variant="outline" size="sm">Export</Button>
                    {showExportOptions && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20">
                            <button onClick={handleExportPDF} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as PDF</button>
                            <button onClick={handleExportExcel} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Export as Excel</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="overflow-y-auto max-h-[600px] relative" ref={tableRef}>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                        <tr>
                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Tên hụi</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số tiền</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Số kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Chu kỳ</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày bắt đầu</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Ngày kết thúc</th>
                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                {type === 'owned' ? 'Tổng tiền thảo' : 'Lợi nhuận/Thua lỗ'}
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {huis.map((hui) => (
                            <tr key={hui.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(hui.id)}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">{hui.name}</td>
                                <td className="px-3 py-4 text-sm">
                                    <StatusBadge status={hui.status} />
                                </td>
                                <td className="px-3 py-4 text-sm text-gray-500">{formatVietnameseCurrency(hui.amount)}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{hui.ky}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{hui.frequency}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{new Date(hui.startDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm text-gray-500">{new Date(hui.endDate).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm">
                                    {type === 'owned' ? (
                                        <span className="text-blue-600">{formatVietnameseCurrency(hui.totalThao)}</span>
                                    ) : (
                                        <span className={hui.profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                                            {formatVietnameseCurrency(hui.profit)}
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
