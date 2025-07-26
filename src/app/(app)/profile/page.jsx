'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserCircleIcon, PencilSquareIcon, CameraIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';

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

const ProfileHeader = ({ user }) => (
    <div className="text-center pt-8 pb-4">
        <div className="relative inline-block group">
            {user.avatar ? (
                <img
                    className="h-32 w-32 rounded-full ring-4 ring-white"
                    src={user.avatar}
                    alt="User Avatar"
                />
            ) : (
                <UserCircleIcon className="h-32 w-32 text-gray-300" />
            )}
             <button className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <CameraIcon className="h-8 w-8" />
            </button>
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{user.name}</h1>
        <p className="text-sm text-gray-500">{user.email}</p>
        <span className="mt-2 inline-flex items-center rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">
            {user.role}
        </span>
    </div>
);

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

const PersonalInfoTab = ({ user, age, isEditing, setIsEditing, formData, setFormData, onSave }) => {

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const birthDateForInput = formData.dateOfBirth ? new Date(formData.dateOfBirth).toISOString().split('T')[0] : '';

    const handleCancel = () => {
        setFormData(user);
        setIsEditing(false);
    };

    return (
        <div className="py-6">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Thông tin cá nhân</h3>
                {isEditing ? (
                    <div className="flex items-center gap-2">
                         <button onClick={onSave} className="text-sm font-medium text-green-600 hover:text-green-500 flex items-center gap-1 p-2 rounded-md bg-green-50">
                            <CheckIcon className="h-5 w-5"/>
                            Lưu
                        </button>
                        <button onClick={handleCancel} className="text-sm font-medium text-red-600 hover:text-red-500 flex items-center gap-1 p-2 rounded-md bg-red-50">
                            <XMarkIcon className="h-5 w-5"/>
                            Hủy
                        </button>
                    </div>
                ) : (
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
        </div>
    );
};

const SecurityTab = () => (
    <div className="py-6">
        <h3 className="text-lg font-semibold text-gray-900">Đổi mật khẩu</h3>
        <p className="mt-2 text-sm text-gray-600">Chức năng này sẽ được triển khai trong thời gian sớm nhất.</p>
        {/* The form can be kept but disabled for now */}
    </div>
);

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

  // When session data is loaded, initialize formData
    useEffect(() => {
    if (session?.user) {
      setFormData({
          name: session.user.name,
          phone: session.user.phone,
          dateOfBirth: session.user.dateOfBirth,
          about: session.user.about,
      });
    }
  }, [session]);
  const handleSave = async () => {
            try {
          // Note: We are now using a different API route for updating the user
          const response = await fetch('/api/user/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

          // Manually trigger a session update to reflect the changes immediately
          await update({ ...session, user: { ...session.user, ...formData } });
            setIsEditing(false);
            alert('Cập nhật thông tin thành công!');

        } catch (error) {
            console.error('Save error:', error);
            alert(`Lỗi: ${error.message}`);
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
            <main className="py-10">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 bg-white shadow rounded-lg">
          <ProfileHeader user={isEditing ? { ...user, ...formData } : user} />
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

