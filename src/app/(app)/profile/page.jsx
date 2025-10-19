'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, PencilSquareIcon, CameraIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import AvatarUploadModal from '@/components/profile/AvatarUploadModal';
import { useToast, Toaster } from '@/components/ui/Toaster';
import Button from '@/components/ui/Button';


// --- Helper Functions ---
const calculateAge = (isoDateString) => {
  if (!isoDateString) return null;
  const birthDate = new Date(isoDateString);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

const formatDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

// --- Sub-components ---

const ProfileHeader = ({ user, onAvatarChange }) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const fileInputRef = useRef(null);

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const reader = new FileReader();
            reader.addEventListener('load', () => setSelectedImage(reader.result));
            reader.readAsDataURL(e.target.files[0]);
            setModalOpen(true);
        }
    };

    const handleAvatarSave = async (blob) => {
        setModalOpen(false);
        onAvatarChange(blob);
    };

    return (
        <>
            <div className="text-center pt-8 pb-4">
                <div className="relative inline-block group">
                    {user.image ? (
                        (() => {
                            let imageUrl = user.image;
                            // Check if the image URL is from our S3 bucket
                            if (imageUrl.includes(process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME)) {
                                const urlParts = new URL(imageUrl).pathname.split('/');
                                const key = urlParts.slice(1).join('/'); // Remove the leading slash
                                imageUrl = `/api/files/${key}`;
                            }
                            return (
                                <img
                                    className="h-32 w-32 rounded-full ring-4 ring-white object-contain"
                                    src={imageUrl}
                                    alt="User Avatar"
                                    key={imageUrl} // Add key to force re-render on change
                                />
                            );
                        })()
                    ) : (
                        <UserCircleIcon className="h-32 w-32 text-gray-300" />
                    )}
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/png, image/jpeg"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <CameraIcon className="h-8 w-8" />
                    </button>
                </div>
                <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{user.name}</h1>
                <p className="text-sm text-gray-500">{user.email}</p>
                <span className="mt-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
                    {user.role}
                </span>
            </div>
            {modalOpen && (
                <AvatarUploadModal
                    src={selectedImage}
                    onSave={handleAvatarSave}
                    onCancel={() => {
                        setModalOpen(false);
                        setSelectedImage(null);
                    }}
                />
            )}
        </>
    );
};

const ProfileTabs = ({ activeTab, setActiveTab }) => {
    const tabs = [
        { name: 'Thông tin cá nhân', id: 'personal' },
        { name: 'Bảo mật', id: 'security' },
    ];

    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`${
                            activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
                    >
                        {tab.name}
                    </button>
                ))}
            </nav>
        </div>
    );
};

const PersonalInfoTab = ({ user, age, isEditing, setIsEditing, formData, setFormData, onSave, qrCodeFile, setQrCodeFile, qrCodePreview, setQrCodePreview }) => {

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleQrFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setQrCodeFile(file);
            setQrCodePreview(URL.createObjectURL(file));
        }
    };

    const birthDateForInput = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : '';

    const handleCancel = () => {
        // Re-initialize form data from the original session user object
        setFormData({
            name: user.name,
            phone: user.phone,
            dateOfBirth: user.dateOfBirth,
            about: user.about,
            bankName: user.bankName,
            bankAccountNumber: user.bankAccountNumber,
            bankAccountName: user.bankAccountName,
            qrCodeUrl: user.qrCodeUrl,
        });
        setIsEditing(false);
    };

    return (
        <div className="py-6">
            {/* Personal Info Section */}
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                {!isEditing && (
                     <button onClick={() => setIsEditing(true)} className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1">
                        <PencilSquareIcon className="h-5 w-5"/>
                        Chỉnh sửa
                    </button>
                )}
            </div>
            <dl className="mt-4 divide-y divide-gray-100">
                 <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Họ và tên</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                        {isEditing ? (
                            <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        ) : (
                            user.name
                        )}
                    </dd>
                </div>
                 <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Email</dt>
                    <dd className="mt-1 text-sm text-gray-500 sm:col-span-2 sm:mt-0">{user.email} (không thể thay đổi)</dd>
                </div>
                <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Số điện thoại</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                         {isEditing ? (
                            <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        ) : (
                            user.phone || 'Chưa cập nhật'
                        )}
                    </dd>
                </div>
                 <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Ngày sinh</dt>
                     <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                         {isEditing ? (
                            <input type="date" name="dateOfBirth" value={birthDateForInput} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        ) : (
                            age ? `${formatDate(user.dateOfBirth)} (${age} tuổi)` : 'Chưa cập nhật'
                        )}
                    </dd>
                </div>
                <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Giới thiệu</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                         {isEditing ? (
                            <textarea name="about" value={formData.about || ''} onChange={handleInputChange} rows={4} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                        ) : (
                            <p className="whitespace-pre-wrap">{user.about || 'Chưa có thông tin giới thiệu.'}</p>
                        )}
                    </dd>
                </div>
                <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                    <dt className="text-sm font-medium text-gray-600">Là thành viên từ</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">{formatDate(user.createdAt)}</dd>
                </div>
            </dl>

            {/* Payment Info Section */}
            <div className="mt-10">
                 <h3 className="text-lg font-semibold text-gray-900">Thông tin thanh toán</h3>
                 <dl className="mt-4 divide-y divide-gray-100">
                    <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-600">Ngân hàng</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {isEditing ? (
                                <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            ) : (
                                user.bankName || 'Chưa cập nhật'
                            )}
                        </dd>
                    </div>
                    <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-600">Tên tài khoản</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {isEditing ? (
                                <input type="text" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            ) : (
                                user.bankAccountName || 'Chưa cập nhật'
                            )}
                        </dd>
                    </div>
                    <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-600">Số tài khoản</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {isEditing ? (
                                <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleInputChange} className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                            ) : (
                                user.bankAccountNumber || 'Chưa cập nhật'
                            )}
                        </dd>
                    </div>
                     <div className="px-1 py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                        <dt className="text-sm font-medium text-gray-600">Mã QR</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                            {isEditing ? (
                                <div>
                                    <input 
                                        type="file" 
                                        name="qrCodeFile" 
                                        onChange={handleQrFileChange} 
                                        accept="image/png, image/jpeg, image/jpg"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    />
                                    {qrCodePreview ? (
                                        <img src={qrCodePreview} alt="QR Code Preview" className="mt-2 h-32 w-32 object-contain border rounded-md" />
                                    ) : (
                                        formData.qrCodeUrl && <img src={formData.qrCodeUrl} alt="Current QR Code" className="mt-2 h-32 w-32 object-contain border rounded-md" />
                                    )}
                                </div>
                            ) : (
                                user.qrCodeUrl ? (
                                    (() => {
                                        const urlParts = user.qrCodeUrl.split('/');
                                        const key = urlParts.slice(3).join('/');
                                        const secureUrl = `/api/files/${key}`;
                                        return (
                                            <a href={secureUrl} target="_blank" rel="noopener noreferrer" title="Xem ảnh đầy đủ">
                                                <img 
                                                    src={secureUrl} 
                                                    alt="QR Code" 
                                                    className="h-24 w-24 object-contain border rounded-md hover:shadow-lg transition-shadow" 
                                                />
                                            </a>
                                        );
                                    })()
                                ) : (
                                    <div className="flex items-center gap-4">
                                        <span>Chưa cập nhật</span>
                                        <button 
                                            onClick={() => setIsEditing(true)} 
                                            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center gap-1"
                                        >
                                            <PencilSquareIcon className="h-5 w-5"/>
                                            Thêm QR
                                        </button>
                                    </div>
                                )
                            )}
                        </dd>
                    </div>
                </dl>
            </div>

            {isEditing && (
                <div className="mt-6 flex justify-end items-center gap-3">
                    <Button variant="secondary" onClick={handleCancel}>Hủy</Button>
                    <Button variant="primary" onClick={onSave}>Lưu tất cả thay đổi</Button>
                </div>
            )}
        </div>
    );
};

const SecurityTab = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (passwords.newPassword !== passwords.confirmPassword) {
            setError('Mật khẩu mới không khớp.');
            return;
        }
        if (passwords.newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/user/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Có lỗi xảy ra.');
            }

            setSuccess('Đổi mật khẩu thành công!');
            setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });

        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="py-6">
            <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
            <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Mật khẩu hiện tại
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="currentPassword"
                            id="currentPassword"
                            value={passwords.currentPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        Mật khẩu mới
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            value={passwords.newPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Xác nhận mật khẩu mới
                    </label>
                    <div className="mt-1">
                        <input
                            type="password"
                            name="confirmPassword"
                            id="confirmPassword"
                            value={passwords.confirmPassword}
                            onChange={handlePasswordChange}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            required
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
};

// --- Main Page Component ---

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, status, update } = useSession({
    required: true,
    onUnauthenticated() {
      // The user is not authenticated, redirect to the new sign-in page.
      router.push('/signin');
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('personal');
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState('');
  const { showToast } = useToast();

  // When session data is loaded, initialize formData
    useEffect(() => {
    if (session?.user) {
      setFormData({
          name: session.user.name,
          phone: session.user.phone,
          dateOfBirth: session.user.dateOfBirth,
          about: session.user.about,
          bankName: session.user.bankName,
          bankAccountNumber: session.user.bankAccountNumber,
          bankAccountName: session.user.bankAccountName,
          qrCodeUrl: session.user.qrCodeUrl,
      });
    }
  }, [session]);

  const handleSave = async () => {
        try {
            let updatedFormData = { ...formData };

            // Step 1: Upload QR code if a new one is selected
            if (qrCodeFile) {
                const qrFd = new FormData();
                qrFd.append('file', qrCodeFile);
                qrFd.append('folder', 'qrcodes');

                const uploadResponse = await fetch('/api/user/upload-image', {
                    method: 'POST',
                    body: qrFd,
                });

                if (!uploadResponse.ok) {
                    const errorData = await uploadResponse.json();
                    throw new Error(errorData.error || 'Failed to upload QR code');
                }
                const { imageUrl } = await uploadResponse.json();
                updatedFormData.qrCodeUrl = imageUrl;
            }

            // Step 2: Update user profile with all data
            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            // Step 3: Manually trigger a session update
            await update({ ...session, user: { ...session.user, ...updatedFormData } });
            
            setIsEditing(false);
            setQrCodeFile(null);
            setQrCodePreview('');
            showToast({ message: "Cập nhật thông tin thành công!", type: 'success' });

        } catch (error) {
            console.error('Save error:', error);
            showToast({ message: `Lỗi: ${error.message}`, type: 'error' });
        }
    };

    const handleAvatarChange = async (avatarBlob) => {
        try {
            // Step 1: Upload the image
            const fd = new FormData();
            fd.append('file', avatarBlob, 'avatar.jpg');
            fd.append('folder', 'avatars');

            const uploadResponse = await fetch('/api/user/upload-image', {
                method: 'POST',
                body: fd,
            });

            if (!uploadResponse.ok) {
                const errorData = await uploadResponse.json();
                throw new Error(errorData.error || 'Failed to upload avatar');
            }

            const { imageUrl } = await uploadResponse.json();

            // Step 2: Save the new URL to the database
            const updateResponse = await fetch('/api/user/update-avatar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.error || 'Failed to update avatar in database');
            }

            // Step 3: Update local state for immediate UI feedback
            setFormData(prev => ({ ...prev, image: imageUrl }));

            // Step 4: Update session to reflect new avatar
            await update({ ...session, user: { ...session.user, image: imageUrl } });
            
            showToast({ message: "Cập nhật ảnh đại diện thành công!", type: 'success' });

        } catch (error) {
            console.error('Avatar upload error:', error);
            showToast({ message: `Lỗi: ${error.message}`, type: 'error' });
        }
    };

  const isLoading = status === 'loading';
  const user = session?.user;
    const age = calculateAge(formData?.dateOfBirth);

  if (isLoading || !formData) {
        return (
      <div className="flex justify-center items-center min-h-[calc(100vh-4rem)]">
        <div className="text-lg">Đang tải hồ sơ...</div>
            </div>
        );
    }

        return (
    <div className="bg-gray-50">
        <Toaster />
            <main className="py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg">
                    <ProfileHeader 
                        user={{ ...user, ...formData }} 
                        onAvatarChange={handleAvatarChange}
                    />
                    <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
                    <div className="px-4 py-2">
                       {activeTab === 'personal' && (
                           <PersonalInfoTab
                                user={user}
                                age={age}
                                isEditing={isEditing}
                                setIsEditing={setIsEditing}
                                formData={formData}
                                setFormData={setFormData}
                                onSave={handleSave}
                                qrCodeFile={qrCodeFile}
                                setQrCodeFile={setQrCodeFile}
                                qrCodePreview={qrCodePreview}
                                setQrCodePreview={setQrCodePreview}
                           />
                        )}
                       {activeTab === 'security' && <SecurityTab />}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProfilePage;
