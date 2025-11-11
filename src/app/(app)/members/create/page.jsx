'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toaster';
import Loading from '@/components/ui/Loading';
import AddMembersPanel from '@/components/hui/AddMembersPanel';
import { Toaster } from '@/components/ui/Toaster';

export default function CreateMultipleMembersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const huiIdFromUrl = searchParams.get('huiId');
  const { showToast } = useToast();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  // State previously from Redux
  const [huis, setHuis] = useState([]);
  const [currentHui, setCurrentHui] = useState(null);
  const [loadingHuis, setLoadingHuis] = useState(false);
  const [loadingCurrentHui, setLoadingCurrentHui] = useState(false);
  const [fetchHuisError, setFetchHuisError] = useState(null);
  const [fetchCurrentHuiError, setFetchCurrentHuiError] = useState(null);

  // Local component state
  const [selectedHuiId, setSelectedHuiId] = useState(huiIdFromUrl || '');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [fetchAllUsersError, setFetchAllUsersError] = useState(null);
  
  const [stagedMembers, setStagedMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch all Huis
  useEffect(() => {
    const fetchAllHuis = async () => {
      if (!isAuthenticated) return;
      setLoadingHuis(true);
      try {
        const response = await fetch('/api/hui');
        if (!response.ok) throw new Error('Failed to fetch huis');
        const data = await response.json();
        setHuis(data);
        setFetchHuisError(null);
      } catch (error) {
        setFetchHuisError(error.message);
      } finally {
        setLoadingHuis(false);
      }
    };
    fetchAllHuis();
  }, [isAuthenticated]);

  // Fetch all system users

  // Fetch details of the selected Hui
  useEffect(() => {
    const fetchHuiDetails = async () => {
      if (selectedHuiId && isAuthenticated) {
        setLoadingCurrentHui(true);
        setFetchCurrentHuiError(null);
        try {
          const response = await fetch(`/api/hui/${selectedHuiId}`);
          if (!response.ok) throw new Error('Failed to fetch hui details');
          const data = await response.json();
          setCurrentHui(data);
        } catch (error) {
          setFetchCurrentHuiError(error.message);
          setCurrentHui(null);
        } finally {
          setLoadingCurrentHui(false);
        }
        setStagedMembers([]); // Clear staged users when hui selection changes
      } else {
        setCurrentHui(null);
      }
    };
    fetchHuiDetails();
  }, [selectedHuiId, isAuthenticated]);
  
  useEffect(() => {
    if (huiIdFromUrl) {
      setSelectedHuiId(huiIdFromUrl);
    }
  }, [huiIdFromUrl]);


  const createMemberAPI = async (userId, groupId) => {
    const response = await fetch('/api/members', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, groupId: groupId }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Unknown error');
    }
    return await response.json();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stagedMembers.length === 0 || !selectedHuiId) {
      showToast({ message: "Vui lòng chọn một hụi và ít nhất một thành viên để thêm.", type: 'error' });
      return;
    }
    setIsSubmitting(true);
    
    const results = { succeeded: [], failed: [] };
    const memberCreationPromises = [];

    stagedMembers.forEach(member => {
      memberCreationPromises.push(
        createMemberAPI(member.userId, selectedHuiId)
          .then(createdMember => results.succeeded.push(createdMember.user ? createdMember.user.name : member.userId))
          .catch(error => results.failed.push({ userId: member.userId, error: error.message }))
      );
    });

    await Promise.allSettled(memberCreationPromises);
    setIsSubmitting(false);

    let message = "";
    let messageType = 'info';

    if (results.succeeded.length > 0) {
      message += `Đã thêm thành công ${results.succeeded.length} thành viên: ${results.succeeded.join(', ')}. `;
      messageType = 'success';
    }
    if (results.failed.length > 0) {
      const failedNames = results.failed.map(f => {
        const user = allUsers.find(u => u.id === f.userId);
        return user ? `${user.name} (${f.error})` : `${f.userId} (${f.error})`;
      });
      message += `Thêm thất bại ${results.failed.length} thành viên: ${failedNames.join(', ')}.`;
      messageType = results.succeeded.length > 0 ? 'warning' : 'error';
    }
    showToast({ message, type: messageType, duration: results.failed.length > 0 ? 7000 : 4000 });

    if (results.succeeded.length > 0) {
        setStagedMembers([]);
        router.push(`/hui/${selectedHuiId}`);
    }
  };

  if (status === 'loading') {
    return <Loading message="Kiểm tra phiên đăng nhập..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-6 text-center">
        <p className="mb-4">Bạn cần đăng nhập để thêm thành viên.</p>
        <Link href="/auth/signin"><Button>Đăng nhập</Button></Link>
      </div>
    );
  }
  
  return (
    <div className="max-w-6xl mx-auto">
      <Toaster />
      <div className="mb-8">
        <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-800 mb-4">
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-800">Thêm thành viên vào Hụi</h1>
        <p className="text-gray-500 mt-1">Chọn hụi và thêm thành viên từ danh sách</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">Chọn Hụi</label>
          <Select
            value={selectedHuiId}
            onChange={(e) => setSelectedHuiId(e.target.value)}
            disabled={isSubmitting || loadingHuis || loadingCurrentHui}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
          >
            <option value="">-- Chọn Hụi --</option>
            {huis.map(hui => (
              <option key={hui.id} value={hui.id}>
                {hui.name} (Số chỗ: {hui.totalMembers || 'N/A'})
              </option>
            ))}
          </Select>
        </div>

        {fetchHuisError && <Alert type="error" message={`Lỗi tải danh sách hụi: ${fetchHuisError}`} />}
        {loadingCurrentHui && selectedHuiId && <Loading message="Đang tải chi tiết hụi..." />}
        {fetchCurrentHuiError && <Alert type="error" message={`Lỗi tải chi tiết hụi: ${fetchCurrentHuiError}`} />}
        {fetchAllUsersError && <Alert type="error" message={`Lỗi tải người dùng: ${fetchAllUsersError}`} />}

        {selectedHuiId && !loadingCurrentHui && currentHui && (
          <AddMembersPanel
            onStagedMembersChange={setStagedMembers}
            totalMembers={currentHui.totalMembers}
          />
        )}

        <div className="mt-8 flex items-center justify-end gap-4 bg-white rounded-xl border border-gray-200 p-6">
          <button type="button" onClick={() => router.back()} disabled={isSubmitting} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Hủy bỏ
          </button>
          <button 
            type="submit" 
            disabled={isSubmitting || stagedMembers.length === 0 || !selectedHuiId || loadingCurrentHui}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            {isSubmitting ? `Đang xử lý...` : `Xác nhận thêm ${stagedMembers.length} thành viên`}
          </button>
        </div>
      </form>
    </div>
  );
}
