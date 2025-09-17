'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/Toaster';

export default function OwnerBankInfoModal({ isOpen, onClose, owner }) {
    const { showToast } = useToast();

    if (!owner) return null;

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text).then(() => {
            showToast({ message: 'Đã sao chép vào clipboard!', type: 'success' });
        }, (err) => {
            showToast({ message: 'Không thể sao chép.', type: 'error' });
            console.error('Could not copy text: ', err);
        });
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Thông tin thanh toán của ${owner.name}`}
            footer={
                <div className="flex justify-end">
                    <Button variant="primary" onClick={onClose}>Đóng</Button>
                </div>
            }
        >
            <div className="space-y-4">
                <InfoRow 
                    label="Ngân hàng" 
                    value={owner.bankName}
                    onCopy={() => handleCopy(owner.bankName)}
                    isCopyable={!!owner.bankName}
                />
                <InfoRow 
                    label="Chủ tài khoản" 
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

                {owner.qrCodeUrl && (
                    <div>
                        <dt className="text-sm font-medium text-gray-500">Mã QR Thanh toán</dt>
                        <dd className="mt-1">
                            <img 
                                src={owner.qrCodeUrl} 
                                alt="QR Code" 
                                className="w-48 h-48 object-contain border rounded-md"
                            />
                        </dd>
                    </div>
                )}

                {!owner.bankName && !owner.bankAccountNumber && !owner.qrCodeUrl && (
                    <p className="text-sm text-gray-500 text-center py-4">
                        Chủ hụi chưa cập nhật thông tin thanh toán.
                    </p>
                )}
            </div>
        </Modal>
    );
}

const InfoRow = ({ label, value, onCopy, isCopyable }) => {
    if (!value) return null;

    return (
        <div>
            <dt className="text-sm font-medium text-gray-500">{label}</dt>
            <dd className="mt-1 flex items-center justify-between">
                <span className="text-sm text-gray-900 font-mono">{value}</span>
                {isCopyable && (
                    <button 
                        onClick={onCopy}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        title="Sao chép"
                    >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                    </button>
                )}
            </dd>
        </div>
    );
};
