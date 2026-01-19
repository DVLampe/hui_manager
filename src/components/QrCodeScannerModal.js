"use client";

import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { QRCodeCanvas } from "qrcode.react";
import { X, Upload, QrCode } from "lucide-react";
import { Capacitor } from "@capacitor/core";
import { motion, useDragControls } from "framer-motion";

const QrCodeScannerModal = ({ isOpen, onClose, onScanSuccess, userProfileLink, userName }) => {
  const [showMyQr, setShowMyQr] = useState(false);
  const [isNative, setIsNative] = useState(false);
  const fileInputRef = useRef(null);
  const scannerRef = useRef(null);
  const controls = useDragControls();

  useEffect(() => {
    if (isOpen) {
      setShowMyQr(false); // Reset to scanner view each time it opens
    }
    setIsNative(Capacitor.isNativePlatform());
  }, [isOpen]);

  useEffect(() => {
    // For mobile, we always show the scanner with the draggable QR sheet.
    // For web, we toggle between scanner and QR code view.
    if (isOpen && (!showMyQr || isNative)) {
      // A small delay to ensure the element is in the DOM.
      const timeoutId = setTimeout(() => {
        const elementId = "qr-reader";
        if (!document.getElementById(elementId)) {
            console.error("QR Reader element not found.");
            return;
        }
        
        const scanner = new Html5Qrcode(elementId);
        scannerRef.current = scanner;

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          rememberLastUsedCamera: true,
        };

        scanner.start({ facingMode: "environment" }, config, onScanSuccess, (error) => {
          // console.warn(`QR error = ${error}`);
        }).catch(err => {
            console.error("Unable to start scanning.", err);
        });
      }, 100); // 100ms delay

      return () => {
        clearTimeout(timeoutId);
        if (scannerRef.current && scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(err => console.error("Failed to stop scanner", err));
        }
      };
    }
  }, [isOpen, showMyQr, onScanSuccess, isNative]);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Use a separate, hidden element for file scanning to avoid conflicts
      const fileScannerId = "qr-reader-file";
      let fileScannerElement = document.getElementById(fileScannerId);
      if (!fileScannerElement) {
          fileScannerElement = document.createElement('div');
          fileScannerElement.id = fileScannerId;
          fileScannerElement.style.display = 'none';
          document.body.appendChild(fileScannerElement);
      }

      try {
        const html5QrCode = new Html5Qrcode(fileScannerId);
        const result = await html5QrCode.scanFile(file, true);
        onScanSuccess(result);
      } catch (err) {
        console.error("Error scanning file.", err);
        alert("Could not scan QR code from file.");
      }
    }
  };

  if (!isOpen) return null;

  // Web Version UI
  const webUI = (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 w-full max-w-md m-4 relative">
      <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 z-10">
        <X size={24} />
      </button>

      <h2 className="text-xl font-bold text-center mb-4">{showMyQr ? "QR của tôi" : "Quét mã QR"}</h2>

      <div className="relative w-full">
        {showMyQr ? (
          <div className="flex flex-col items-center justify-center p-4">
            <QRCodeCanvas value={userProfileLink} size={256} level="H" />
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">Quét mã này để thêm bạn bè</p>
            {userName && <p className="mt-2 text-lg font-semibold text-gray-800 dark:text-gray-200">{userName}</p>}
          </div>
        ) : (
          <>
            <div id="qr-reader" className="w-full"></div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-2 left-2 bg-white/80 rounded-full p-2"
              title="Upload QR from gallery"
            >
              <Upload size={20} />
            </button>
          </>
        )}
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowMyQr(!showMyQr)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
        >
          <QrCode size={20} />
          {showMyQr ? "Quay lại quét" : "QR của tôi"}
        </button>
      </div>
    </div>
  );

  // Mobile Version UI
  const mobileUI = (
    <div className="w-full h-full bg-black relative">
      <div id="qr-reader" className="w-full h-full absolute inset-0"></div>
      
      {/* Close and Upload buttons */}
      <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 rounded-full p-2 text-white">
        <X size={28} />
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="absolute top-4 left-4 bg-black/50 rounded-full p-2 text-white"
        title="Upload QR from gallery"
      >
        <Upload size={28} />
      </button>

      {/* Draggable My QR Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 shadow-lg"
        drag="y"
        dragControls={controls}
        dragConstraints={{ top: -300, bottom: 0 }}
        dragElastic={0.2}
        initial={{ y: 0 }}
        style={{ touchAction: 'none' }}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" onPointerDown={(e) => controls.start(e)}></div>
        <div className="flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold mb-2">QR của tôi</h3>
            <QRCodeCanvas value={userProfileLink} size={200} level="H" />
            {userName && <p className="mt-2 text-lg font-semibold text-gray-800">{userName}</p>}
            <p className="mt-2 text-sm text-gray-500">Vuốt lên để xem đầy đủ</p>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      {isNative ? mobileUI : webUI}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default QrCodeScannerModal;
