'use client';
import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createMember, resetCreateStatus } from '@/store/memberSlice';
import { fetchHuis, fetchHuiById } from '@/store/huiSlice';
import { useRouter, useSearchParams } from 'next/navigation';
import Layout from '@/components/shared/Layout';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';
import Link from 'next/link';
import axios from 'axios';
import { useToast } from '@/components/ui/Toaster';

export default function CreateMultipleMembersPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const huiIdFromUrl = searchParams.get('huiId');
  const { showToast } = useToast();

  const { huis, currentHui, fetchHuiByIdLoading } = useSelector(state => state.hui);
  const { isAuthenticated } = useSelector(state => state.auth);

  const [selectedHuiId, setSelectedHuiId] = useState(huiIdFromUrl || '');
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [fetchAllUsersError, setFetchAllUsersError] = useState(null);
  
  const [stagedForAdditionUserIds, setStagedForAdditionUserIds] = useState(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    dispatch(fetchHuis());
  }, [dispatch]);

  useEffect(() => {
    async function fetchAllSystemUsers() {
      if (!isAuthenticated) return;
      setLoadingAllUsers(true);
      try {
        const response = await axios.get('/api/users');
        setAllUsers(response.data || []);
        setFetchAllUsersError(null);
      } catch (err) {
        setFetchAllUsersError(err.response?.data?.error || 'Failed to fetch users');
        setAllUsers([]);
      } finally {
        setLoadingAllUsers(false);
      }
    }
    fetchAllSystemUsers();
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedHuiId && isAuthenticated) {
      dispatch(fetchHuiById(selectedHuiId));
      setStagedForAdditionUserIds(new Set()); // Clear staged users when hui selection changes
    }
  }, [selectedHuiId, isAuthenticated, dispatch]);
  
  useEffect(() => {
    if (huiIdFromUrl) {
      setSelectedHuiId(huiIdFromUrl);
    }
  }, [huiIdFromUrl]);

  const currentHuiMemberUserIds = useMemo(() => {
    return new Set(currentHui?.members?.map(member => member.userId) || []);
  }, [currentHui]);

  const leftPanelAvailableUsers = useMemo(() => {
    if (loadingAllUsers || fetchHuiByIdLoading) return [];
    return allUsers.filter(user => 
      !currentHuiMemberUserIds.has(user.id) && 
      !stagedForAdditionUserIds.has(user.id)
    );
  }, [allUsers, currentHuiMemberUserIds, stagedForAdditionUserIds, loadingAllUsers, fetchHuiByIdLoading]);

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
        dispatch(createMember({ userId: userId, groupId: selectedHuiId })).unwrap()
          .then(createdMember => results.succeeded.push(createdMember.user ? createdMember.user.name : userId))
          .catch(error => results.failed.push({ userId, error: error.message || 'Unknown error' }))
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
        dispatch(fetchHuiById(selectedHuiId)); // Re-fetch hui details to update its member list in Redux store
        setStagedForAdditionUserIds(new Set()); // Clear the staged users list
        router.push(`/hui/${selectedHuiId}`); // Navigate to the hui detail page
    }
    dispatch(resetCreateStatus()); // Reset the create status in Redux store
  };

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-2xl mx-auto py-6 text-center">
          <p className="mb-4">Bạn cần đăng nhập để thêm thành viên.</p>
          <Link href="/auth/signin"><Button>Đăng nhập</Button></Link>
        </div>
      </Layout>
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
          variant={isRemoveAction ? 'danger' : 'primary'} // Use variants from Button.jsx
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
    <Layout>
      <div className="max-w-6xl mx-auto py-6">
        <h1 className="text-2xl font-bold mb-6">Thêm nhiều thành viên vào Hụi</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Chọn Hụi</label>
            <Select
              value={selectedHuiId}
              onChange={(e) => setSelectedHuiId(e.target.value)}
              disabled={isSubmitting || fetchHuiByIdLoading}
            >
              <option value="">-- Chọn Hụi --</option>
              {huis && huis.map(hui => (
                <option key={hui.id} value={hui.id}>
                  {hui.name} (Số chỗ: {hui.totalMembers || 'N/A'})
                </option>
              ))}
            </Select>
          </div>

          {!selectedHuiId && (
            <p className="text-gray-600 mt-4 text-center">Vui lòng chọn một hụi để quản lý thành viên.</p>
          )}

          {fetchHuiByIdLoading && selectedHuiId && <p className="text-center mt-4">Đang tải chi tiết hụi...</p>}
          {fetchAllUsersError && <p className="text-red-500 text-center mt-4">Lỗi tải người dùng: {fetchAllUsersError}</p>}

          {selectedHuiId && !fetchHuiByIdLoading && currentHui && (
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
              disabled={isSubmitting || stagedForAdditionUserIds.size === 0 || !selectedHuiId || fetchHuiByIdLoading}
              variant="primary" // Main submit button
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
    </Layout>
  );
}
