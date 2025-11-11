'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useIsMobile } from '@/lib/hooks';
import { Camera, Edit, Eye, EyeOff, Lock, Settings, ChevronRight } from 'lucide-react';
import AvatarUploadModal from '@/components/profile/AvatarUploadModal';
import QrCodeModal from '@/components/profile/QrCodeModal';
import { useToast, Toaster } from '@/components/ui/Toaster';

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
            <div className="flex items-start gap-6">
                <div className="relative group">
                    <div className="w-32 h-32 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white text-5xl font-bold">
                        {user.name ? user.name.charAt(0) : 'U'}
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        className="hidden"
                        accept="image/png, image/jpeg"
                    />
                    <button
                        onClick={() => fileInputRef.current.click()}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Camera className="w-8 h-8 text-white" />
                    </button>
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-800 mb-1">{user.name}</h1>
                    <p className="text-gray-500 mb-2">{user.email}</p>
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                        {user.role}
                    </span>
                </div>
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
        { name: 'Thông tin cá nhân', id: 'info' },
        { name: 'Bảo mật', id: 'security' },
    ];

    return (
        <div className="border-b border-gray-200">
            <div className="flex gap-1 p-2">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            activeTab === tab.id
                                ? 'bg-red-600 text-white'
                                : 'text-gray-600 hover:bg-gray-50'
                        }`}
                    >
                        {tab.name}
                    </button>
                ))}
            </div>
        </div>
    );
};

const PersonalInfoTab = ({ user, age, isEditing, setIsEditing, formData, setFormData, onSave, qrCodeFile, setQrCodeFile, qrCodePreview, setQrCodePreview }) => {
    const [isQrModalOpen, setIsQrModalOpen] = useState(false);

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

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-800">Thông tin cá nhân</h2>
                <button onClick={() => setIsEditing(!isEditing)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <Edit className="w-4 h-4" />
                    <span className="text-sm font-medium">{isEditing ? 'Hủy' : 'Chỉnh sửa'}</span>
                </button>
            </div>
            <div className="space-y-6">
                <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin chung</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Họ và tên</label>
                            {isEditing ? (
                                <input type="text" name="name" value={formData.name || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.name}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <p className="text-gray-800">{user.email}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại</label>
                            {isEditing ? (
                                <input type="tel" name="phone" value={formData.phone || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.phone || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày sinh</label>
                            {isEditing ? (
                                <input type="date" name="dateOfBirth" value={birthDateForInput} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{age ? `${formatDate(user.dateOfBirth)} (${age} tuổi)` : 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Giới thiệu</label>
                            {isEditing ? (
                                <textarea rows={3} name="about" value={formData.about || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.about || 'Chưa có thông tin giới thiệu.'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Là thành viên từ</label>
                            <p className="text-gray-800">{formatDate(user.createdAt)}</p>
                        </div>
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Thông tin thanh toán</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngân hàng</label>
                            {isEditing ? (
                                <input type="text" name="bankName" value={formData.bankName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.bankName || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tên tài khoản</label>
                            {isEditing ? (
                                <input type="text" name="bankAccountName" value={formData.bankAccountName || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.bankAccountName || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Số tài khoản</label>
                            {isEditing ? (
                                <input type="text" name="bankAccountNumber" value={formData.bankAccountNumber || ''} onChange={handleInputChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <p className="text-gray-800">{user.bankAccountNumber || 'Chưa cập nhật'}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Mã QR</label>
                            {isEditing ? (
                                <input type="file" accept="image/*" onChange={handleQrFileChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                            ) : (
                                <button type="button" onClick={() => setIsQrModalOpen(true)} className="text-blue-600 cursor-pointer hover:underline">Xem QR code</button>
                            )}
                        </div>
                    </div>
                </div>
                <QrCodeModal 
                    isOpen={isQrModalOpen} 
                    onClose={() => setIsQrModalOpen(false)} 
                    qrCodeUrl={user.qrCodeUrl}
                />
                {isEditing && (
                    <div className="flex justify-end pt-4">
                        <button onClick={onSave} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
                            Lưu tất cả thay đổi
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const SecurityTab = () => {
    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
        <div>
            <h2 className="text-xl font-bold text-gray-800 mb-6">Đổi mật khẩu</h2>
            <form className="max-w-xl space-y-5" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu hiện tại</label>
                    <div className="relative">
                        <input type={showCurrentPassword ? "text" : "password"} name="currentPassword" value={passwords.currentPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Mật khẩu mới</label>
                    <div className="relative">
                        <input type={showNewPassword ? "text" : "password"} name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Xác nhận mật khẩu mới</label>
                    <div className="relative">
                        <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} className="w-full px-4 py-2 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" required />
                        <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <div className="flex justify-end pt-4">
                    <button type="submit" disabled={isLoading} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
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
      router.push('/signin');
    },
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [qrCodeFile, setQrCodeFile] = useState(null);
  const [qrCodePreview, setQrCodePreview] = useState('');
  const { showToast } = useToast();
  const isMobile = useIsMobile();

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

            const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedFormData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

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

            const updateResponse = await fetch('/api/user/update-avatar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageUrl }),
            });

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json();
                throw new Error(errorData.error || 'Failed to update avatar in database');
            }

            setFormData(prev => ({ ...prev, image: imageUrl }));

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

  if (isMobile) {
    return (
      <div className="pb-24">
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-gray-800 rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4 text-white" />
              </button>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-sm text-gray-500">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                {user.role}
              </span>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-gray-500 mb-1">Số điện thoại</p>
              <p className="text-gray-800 font-medium">{user.phone || 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
              <p className="text-gray-800 font-medium">{age ? `${formatDate(user.dateOfBirth)}` : 'Chưa cập nhật'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Ngân hàng</p>
              <p className="text-gray-800 font-medium">{user.bankName ? `${user.bankName} - ${user.bankAccountNumber}` : 'Chưa cập nhật'}</p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Edit className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Chỉnh sửa hồ sơ</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Đổi mật khẩu</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200">
            <div className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-800">Cài đặt</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="bg-white rounded-xl border border-gray-200 p-8 mb-6">
        <ProfileHeader user={{ ...user, ...formData }} onAvatarChange={handleAvatarChange} />
      </div>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="p-8">
          {activeTab === 'info' && (
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
    </div>
  );
};

export default ProfilePage;
