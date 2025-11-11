'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { ClipboardCopy } from 'lucide-react';
import { useToast } from '@/components/ui/Toaster';
import QrCodeModal from '@/components/profile/QrCodeModal';

export default function OwnerBankInfoModal({ isOpen, onClose, owner }) {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);
    const { showToast } = useToast();

    if (!owner) return null;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast({ message: 'Đã sao chép!', type: 'success' });
        }, (err) => {
            showToast({ message: 'Không thể sao chép.', type: 'error' });
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose} title={`QR Chuyển khoản`}>
                <div className="p-6 text-center">
                    {owner.qrCodeUrl && (
                        <div className="bg-gray-100 rounded-lg p-8 mb-6">
                            <button onClick={() => setIsQrModalOpen(true)}>
                                {(() => {
                                    const urlParts = owner.qrCodeUrl.split('/');
                                    const key = urlParts.slice(3).join('/');
                                    const secureUrl = `/api/files/${key}`;
                                    return (
                                        <img 
                                            src={secureUrl} 
                                            alt="QR Code" 
                                            className="w-64 h-64 mx-auto object-contain border-2 border-gray-300 rounded-lg cursor-pointer"
                                        />
                                    );
                                })()}
                            </button>
                        </div>
                    )}

                <div className="space-y-3 text-left">
                    <InfoRow 
                        label="Ngân hàng" 
                        value={owner.bankName}
                        onCopy={() => handleCopy(owner.bankName)}
                        isCopyable={!!owner.bankName}
                    />
                    <InfoRow 
                        label="Tên tài khoản" 
                        value={owner.bankAccountName}
                        onCopy={() => handleCopy(owner.bankAccountName)}
                        isCopyable={!!owner.bankAccountName}
                    />
                    <InfoRow 
                        label="Số tài khoản" 
                        value={owner.bankAccountNumber} 
                        onCopy={() => handleCopy(owner.bankAccountNumber)}
                        isCopyable={!!owner.bankAccountNumber}
                    />
                </div>

                {!owner.bankName && !owner.bankAccountNumber && !owner.qrCodeUrl && (
                    <p className="text-sm text-gray-500 text-center py-8">
                        Chủ hụi chưa cập nhật thông tin thanh toán.
                    </p>
                )}
            </div>
            <div className="p-6 border-t border-gray-200">
              <button 
                onClick={onClose}
                className="w-full px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Đóng
              </button>
            </div>
        </Modal>
        <QrCodeModal 
            isOpen={isQrModalOpen} 
            onClose={() => setIsQrModalOpen(false)} 
            qrCodeUrl={owner.qrCodeUrl}
        />
        </>
    );
}

const InfoRow = ({ label, value, onCopy, isCopyable }) => {
    if (!value) return null;

    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
            <div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="font-medium text-gray-800">{value}</p>
            </div>
            {isCopyable && (
                <button 
                    onClick={onCopy}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                    title="Sao chép"
                >
                    <ClipboardCopy className="h-5 w-5" />
                </button>
            )}
        </div>
    );
};
