import React from 'react';

const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(parseFloat(num))) {
    return 'N/A';
  }
  return parseFloat(num).toLocaleString('vi-VN');
};

const BankInfoDisplay = ({ bankInfo }) => {
  if (!bankInfo) return null;
  return (
    <div className="text-xs mt-2 space-y-1">
      <p><strong>Ngân hàng:</strong> {bankInfo.bankName}</p>
      <p><strong>Chủ tài khoản:</strong> {bankInfo.bankAccountName}</p>
      <p><strong>Số tài khoản:</strong> {bankInfo.bankAccountNumber}</p>
    </div>
  );
};

const SummaryPage = ({ hui, period, potTaker, calculationDetails, bankInfo }) => {
  const { huiSongCount, huiChetCount, tienHuiSong, tienHuiChet, thao, tienHot, huiSongMembers, huiChetMembers } = calculationDetails;

  return (
    <div className="invoice-page p-8 bg-white text-gray-800 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">HÓA ĐƠN HỐT HỤI</h1>
        <p className="text-sm text-gray-500">{new Date().toLocaleDateString('vi-VN')}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-2 mb-3">Thông tin Hụi</h2>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <p><span className="font-semibold">Tên hụi:</span> {hui.name}</p>
          <p><span className="font-semibold">Kỳ hốt:</span> {period.period}</p>
          <p><span className="font-semibold">Ngày hốt:</span> {new Date().toLocaleDateString('vi-VN')}</p>
          <p><span className="font-semibold">Thành viên hốt:</span> {potTaker.user?.name || potTaker.guestName}</p>
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold border-b pb-2 mb-3">Chi tiết tính tiền</h2>
        <table className="w-full text-left">
          <tbody>
            <tr className="border-b">
              <td className="py-2">Hụi sống</td>
              <td className="text-right">{huiSongCount} x {formatNumber(hui.amount - (period.thamKeu || 0))}</td>
              <td className="text-right">{formatNumber(tienHuiSong)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Hụi chết</td>
              <td className="text-right">{huiChetCount} x {formatNumber(hui.amount)}</td>
              <td className="text-right">{formatNumber(tienHuiChet)}</td>
            </tr>
            <tr className="border-b">
              <td className="py-2">Thảo</td>
              <td colSpan="2" className="text-right">- {formatNumber(thao)}</td>
            </tr>
            <tr className="font-bold">
              <td className="py-2 text-lg">TỔNG TIỀN HỐT</td>
              <td colSpan="2" className="text-right text-lg">{formatNumber(tienHot)} VNĐ</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 gap-x-8 mb-6">
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Hụi Sống ({huiSongCount})</h3>
          {huiSongMembers.map(member => (
            <div key={member.id} className="flex justify-between text-sm">
              <span>{member.user?.name || member.guestName}</span>
              <span>{formatNumber(hui.amount - (period.thamKeu || 0))}</span>
            </div>
          ))}
        </div>
        <div>
          <h3 className="text-lg font-semibold border-b pb-2 mb-3">Hụi Chết ({huiChetCount})</h3>
          {huiChetMembers.map(member => (
            <div key={member.id} className="flex justify-between text-sm">
              <span>{member.user?.name || member.guestName}</span>
              <span>{formatNumber(hui.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-start mt-8">
        <div className="w-1/2">
          <h3 className="text-lg font-semibold mb-2">Nội dung chuyển khoản</h3>
          <div className="space-y-2">
            <p className="text-sm bg-gray-100 p-2 rounded">
              <strong>Hụi sống:</strong> {`Đóng hụi ${hui.name} kỳ ${period.period} hụi sống - ${formatNumber(hui.amount - (period.thamKeu || 0))}`}
            </p>
            <p className="text-sm bg-gray-100 p-2 rounded">
              <strong>Hụi chết:</strong> {`Đóng hụi ${hui.name} kỳ ${period.period} hụi chết - ${formatNumber(hui.amount)}`}
            </p>
          </div>
        </div>
        <div className="w-1/2 flex justify-center items-center">
          <div className="w-32 h-32 bg-gray-300 flex items-center justify-center mr-4">
            <p className="text-gray-500 text-sm">QR Code</p>
          </div>
          <BankInfoDisplay bankInfo={bankInfo} />
        </div>
      </div>
    </div>
  );
};

const InvoicePage = ({ hui, period, member, memberType, amount, bankInfo }) => (
  <div className="invoice-page p-8 bg-white text-gray-800 font-sans">
    <div className="text-center mb-8">
      <h1 className="text-3xl font-bold text-gray-900">HÓA ĐƠN ĐÓNG HỤI</h1>
      <p className="text-sm text-gray-500">{new Date().toLocaleDateString('vi-VN')}</p>
    </div>

    <div className="mb-6">
      <h2 className="text-xl font-semibold border-b pb-2 mb-3">Thông tin Hụi</h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <p><span className="font-semibold">Tên hụi:</span> {hui.name}</p>
        <p><span className="font-semibold">Kỳ đóng:</span> {period.period}</p>
        <p><span className="font-semibold">Ngày đóng:</span> {new Date().toLocaleDateString('vi-VN')}</p>
      </div>
    </div>

    <div className="mb-6">
      <h2 className="text-xl font-semibold border-b pb-2 mb-3">Chi tiết tính tiền</h2>
      <table className="w-full text-left">
        <tbody>
          <tr className="border-b">
            <td className="py-2">Hụi viên</td>
            <td className="text-right font-bold">{member.user?.name || member.guestName}</td>
          </tr>
          <tr className="border-b">
            <td className="py-2">Loại hụi</td>
            <td className="text-right">{memberType}</td>
          </tr>
          <tr className="font-bold">
            <td className="py-2 text-lg">SỐ TIỀN PHẢI ĐÓNG</td>
            <td className="text-right text-lg">{formatNumber(amount)} VNĐ</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div className="flex justify-between items-start mt-8">
      <div className="w-1/2">
        <h3 className="text-lg font-semibold mb-2">Nội dung chuyển khoản</h3>
        <p className="text-sm bg-gray-100 p-2 rounded">
          {`Đóng hụi ${hui.name} kỳ ${period.period} - ${member.user?.name || member.guestName}`}
        </p>
      </div>
      <div className="w-1/2 flex justify-center items-center">
        <div className="w-32 h-32 bg-gray-300 flex items-center justify-center mr-4">
          <p className="text-gray-500 text-sm">QR Code</p>
        </div>
        <BankInfoDisplay bankInfo={bankInfo} />
      </div>
    </div>
  </div>
);

const HuiInvoice = ({ hui, period, potTaker, calculationDetails }) => {
  if (!hui || !period || !potTaker || !calculationDetails) {
    return null;
  }

  const { huiSongMembers, huiChetMembers } = calculationDetails;
  const allMembers = [...huiSongMembers, ...huiChetMembers];
  const membersToInvoice = allMembers.filter(m => m.id !== potTaker.id);

  const bankInfo = hui.manager;

  return (
    <div id="invoice-content-for-pdf">
      <div className="printable-page">
        <SummaryPage
          hui={hui}
          period={period}
          potTaker={potTaker}
          calculationDetails={calculationDetails}
          bankInfo={bankInfo}
        />
      </div>
      {membersToInvoice.map(member => {
        const isHuiSong = huiSongMembers.some(m => m.id === member.id);
        const amount = isHuiSong ? hui.amount - (period.thamKeu || 0) : hui.amount;
        return (
          <div key={member.id} className="printable-page">
            <InvoicePage
              hui={hui}
              period={period}
              member={member}
              memberType={isHuiSong ? 'Hụi Sống' : 'Hụi Chết'}
              amount={amount}
              bankInfo={bankInfo}
            />
          </div>
        );
      })}
    </div>
  );
};

export default HuiInvoice;
