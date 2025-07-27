'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Link from 'next/link';
import { useToast } from '@/components/ui/Toaster';
import Loading from '@/components/ui/Loading';

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
  
  const [stagedForAdditionUserIds, setStagedForAdditionUserIds] = useState(new Set());
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
  useEffect(() => {
    const fetchAllSystemUsers = async () => {
      if (!isAuthenticated) return;
      setLoadingAllUsers(true);
      try {
        const response = await fetch('/api/users');
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        setAllUsers(data || []);
        setFetchAllUsersError(null);
      } catch (err) {
        setFetchAllUsersError(err.message);
        setAllUsers([]);
      } finally {
        setLoadingAllUsers(false);
      }
    };
    fetchAllSystemUsers();
  }, [isAuthenticated]);

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
        setStagedForAdditionUserIds(new Set()); // Clear staged users when hui selection changes
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

  const currentHuiMemberUserIds = useMemo(() => {
    return new Set(currentHui?.members?.map(member => member.userId) || []);
  }, [currentHui]);

  const leftPanelAvailableUsers = useMemo(() => {
    if (loadingAllUsers || loadingCurrentHui) return [];
    return allUsers.filter(user => 
      !currentHuiMemberUserIds.has(user.id) && 
      !stagedForAdditionUserIds.has(user.id)
    );
  }, [allUsers, currentHuiMemberUserIds, stagedForAdditionUserIds, loadingAllUsers, loadingCurrentHui]);

  const rightPanelStagedUsers = useMemo(() => {
    if (loadingAllUsers) return [];
    return allUsers.filter(user => stagedForAdditionUserIds.has(user.id));
  }, [allUsers, stagedForAdditionUserIds, loadingAllUsers]);
  
  const huiCapacity = currentHui?.totalMembers || 0;
  const currentMemberCount = currentHui?.members?.length || 0;
  const remainingCapacity = huiCapacity - currentMemberCount;
  const canStageMoreUsers = stagedForAdditionUserIds.size < remainingCapacity;

  const handleStageUser = (userId) => {
    if (canStageMoreUsers) {
      setStagedForAdditionUserIds(prevIds => new Set(prevIds).add(userId));
    } else {
      showToast({ message: "Đã đạt số lượng thành viên tối đa cho hụi này.", type: 'warning' });
    }
  };

  const handleUnstageUser = (userId) => {
    setStagedForAdditionUserIds(prevIds => {
      const newIds = new Set(prevIds);
      newIds.delete(userId);
      return newIds;
    });
  };

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
    if (stagedForAdditionUserIds.size === 0 || !selectedHuiId) {
      showToast({ message: "Vui lòng chọn một hụi và ít nhất một thành viên để thêm.", type: 'error' });
      return;
    }
    setIsSubmitting(true);
    
    const results = { succeeded: [], failed: [] };
    const memberCreationPromises = [];

    stagedForAdditionUserIds.forEach(userId => {
      memberCreationPromises.push(
        createMemberAPI(userId, selectedHuiId)
          .then(createdMember => results.succeeded.push(createdMember.user ? createdMember.user.name : userId))
          .catch(error => results.failed.push({ userId, error: error.message }))
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
        setStagedForAdditionUserIds(new Set());
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
  
  const UserListItem = ({ user, onAction, actionLabel, disabled }) => {
    const isRemoveAction = actionLabel.includes("Xóa") || actionLabel.includes("Remove");

    return (
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 hover:bg-gray-50">
        <div>
          <p className="text-sm font-medium text-gray-800 truncate">{user.name}</p>
          <p className="text-xs text-gray-500 truncate">{user.email || 'No email'}</p>
        </div>
        <Button 
          type="button" 
          variant={isRemoveAction ? 'danger' : 'primary'}
          size="sm" 
          onClick={() => onAction(user.id)} 
          disabled={disabled}
        >
          {actionLabel}
        </Button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Thêm nhiều thành viên vào Hụi</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Chọn Hụi</label>
          <Select
            value={selectedHuiId}
            onChange={(e) => setSelectedHuiId(e.target.value)}
            disabled={isSubmitting || loadingHuis || loadingCurrentHui}
          >
            <option value="">-- Chọn Hụi --</option>
            {huis.map(hui => (
              <option key={hui.id} value={hui.id}>
                {hui.name} (Số chỗ: {hui.totalMembers || 'N/A'})
              </option>
            ))}
          </Select>
        </div>

        {!selectedHuiId && (
          <p className="text-gray-600 mt-4 text-center">Vui lòng chọn một hụi để quản lý thành viên.</p>
        )}

        {fetchHuisError && <p className="text-red-500 text-center mt-4">Lỗi tải danh sách hụi: {fetchHuisError}</p>}
        {loadingCurrentHui && selectedHuiId && <p className="text-center mt-4">Đang tải chi tiết hụi...</p>}
        {fetchCurrentHuiError && <p className="text-red-500 text-center mt-4">Lỗi tải chi tiết hụi: {fetchCurrentHuiError}</p>}
        {fetchAllUsersError && <p className="text-red-500 text-center mt-4">Lỗi tải người dùng: {fetchAllUsersError}</p>}

        {selectedHuiId && !loadingCurrentHui && currentHui && (
          <div className="mt-6">
            <div className="flex flex-col md:flex-row md:space-x-6">
              {/* Left Panel: Available System Users */}
              <div className="md:w-1/2 bg-white shadow-lg rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold px-6 py-4 text-gray-800 border-b border-gray-200">
                  Người dùng khả dụng ({leftPanelAvailableUsers.length})
                </h3>
                {loadingAllUsers && <p className="px-6 py-4 text-gray-500">Đang tải danh sách người dùng...</p>}
                {!loadingAllUsers && leftPanelAvailableUsers.length === 0 && !fetchAllUsersError && (
                  <p className="px-6 py-4 text-gray-500">Không có người dùng nào khả dụng hoặc tất cả đã được chọn.</p>
                )}
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                  {leftPanelAvailableUsers.map(user => (
                    <UserListItem 
                      key={user.id} 
                      user={user} 
                      onAction={handleStageUser} 
                      actionLabel="Thêm vào Hụi ->"
                      disabled={!canStageMoreUsers && !stagedForAdditionUserIds.has(user.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Right Panel: Users Staged for Addition */}
              <div className="md:w-1/2 mt-6 md:mt-0 bg-white shadow-lg rounded-lg overflow-hidden">
                <h3 className="text-lg font-semibold px-6 py-4 text-gray-800 border-b border-gray-200">
                  Thành viên sẽ thêm ({stagedForAdditionUserIds.size})
                </h3>
                {rightPanelStagedUsers.length === 0 && (
                  <p className="px-6 py-4 text-gray-500">Chưa chọn thành viên nào để thêm.</p>
                )}
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                  {rightPanelStagedUsers.map(user => (
                    <UserListItem 
                      key={user.id} 
                      user={user} 
                      onAction={handleUnstageUser} 
                      actionLabel="<- Xóa" 
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex space-x-4 pt-6">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isSubmitting || stagedForAdditionUserIds.size === 0 || !selectedHuiId || loadingCurrentHui}
            variant="primary"
          >
            {isSubmitting ? `Đang xử lý...` : `Xác nhận thêm ${stagedForAdditionUserIds.size} thành viên`}
          </Button>
          <Button 
            type="button" 
            variant="secondary"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Hủy bỏ
          </Button>
        </div>
      </form>
    </div>
  );
}
