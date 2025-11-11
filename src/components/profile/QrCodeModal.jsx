'use client';
import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { X } from 'lucide-react';

const QrCodeModal = ({ isOpen, onClose, qrCodeUrl, isEditing, onFileChange }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Mã QR Thanh toán">
      <div className="p-6 text-center">
        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tải lên mã QR mới</label>
            <input 
              type="file" 
              accept="image/*"
              onChange={onFileChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
        ) : qrCodeUrl ? (
          (() => {
            const urlParts = qrCodeUrl.split('/');
            const key = urlParts.slice(3).join('/');
            const secureUrl = `/api/files/${key}`;
            return (
              <img 
                src={secureUrl} 
                alt="QR Code" 
                className="w-64 h-64 mx-auto object-contain border-2 border-gray-300 rounded-lg"
              />
            );
          })()
        ) : (
          <p className="text-gray-500">Chưa có mã QR.</p>
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
  );
};

export default QrCodeModal;
