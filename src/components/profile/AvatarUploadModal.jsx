'use client';

import React, { useState, useRef } from 'react';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function AvatarUploadModal({ src, onSave, onCancel }) {
    const [crop, setCrop] = useState();
    const imgRef = useRef(null);

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop(
                {
                    unit: '%',
                    width: 90,
                },
                1, // aspect ratio 1:1
                width,
                height
            ),
            width,
            height
        );
        setCrop(crop);
    };

    const handleSave = async () => {
        if (!imgRef.current || !crop || !crop.width || !crop.height) {
            return;
        }

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        const pixelRatio = window.devicePixelRatio;
        canvas.width = crop.width * pixelRatio;
        canvas.height = crop.height * pixelRatio;
        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.imageSmoothingQuality = 'high';

        ctx.drawImage(
            imgRef.current,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    console.error('Canvas is empty');
                    return;
                }
                onSave(blob);
            },
            'image/jpeg',
            0.95
        );
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
                <h2 className="text-xl font-semibold mb-4">Chỉnh sửa ảnh đại diện</h2>
                <div className="flex justify-center">
                    <ReactCrop
                        crop={crop}
                        onChange={c => setCrop(c)}
                        aspect={1}
                        circularCrop
                    >
                        <img ref={imgRef} src={src} onLoad={onImageLoad} alt="Crop preview" style={{ maxHeight: '70vh' }}/>
                    </ReactCrop>
                </div>
                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        Lưu thay đổi
                    </button>
                </div>
            </div>
        </div>
    );
}

export default AvatarUploadModal;
