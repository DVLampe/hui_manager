'use client';
import { useState, useEffect, useMemo } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toaster';

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

export default function AddMembersPanel({ onStagedMembersChange, totalMembers }) {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [fetchAllUsersError, setFetchAllUsersError] = useState(null);
  const [stagedForAdditionUserIds, setStagedForAdditionUserIds] = useState(new Set());
  const [guestName, setGuestName] = useState('');

  useEffect(() => {
    const fetchAllSystemUsers = async () => {
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
  }, []);

  useEffect(() => {
    const stagedMembers = Array.from(stagedForAdditionUserIds).map(item => {
      if (typeof item === 'string' && !item.startsWith('guest:')) {
        return { userId: item };
      } else {
        return { guestName: item.replace('guest:', '') };
      }
    });
    onStagedMembersChange(stagedMembers);
  }, [stagedForAdditionUserIds, onStagedMembersChange]);

  const leftPanelAvailableUsers = useMemo(() => {
    if (loadingAllUsers) return [];
    return allUsers.filter(user => !stagedForAdditionUserIds.has(user.id));
  }, [allUsers, stagedForAdditionUserIds, loadingAllUsers]);

  const rightPanelStagedUsers = useMemo(() => {
    return Array.from(stagedForAdditionUserIds).map(item => {
      if (typeof item === 'string' && !item.startsWith('guest:')) {
        const user = allUsers.find(u => u.id === item);
        return user ? { id: user.id, name: user.name, email: user.email } : null;
      } else {
        const guestName = item.replace('guest:', '');
        return { id: item, name: guestName, email: 'Guest' };
      }
    }).filter(Boolean);
  }, [allUsers, stagedForAdditionUserIds]);

  const remainingCapacity = totalMembers ? totalMembers - stagedForAdditionUserIds.size : Infinity;
  const canStageMoreUsers = remainingCapacity > 0;

  const handleStageUser = (userId) => {
    if (canStageMoreUsers) {
      setStagedForAdditionUserIds(prevIds => new Set(prevIds).add(userId));
    } else {
      showToast({ message: "Đã đạt số lượng thành viên tối đa cho hụi này.", type: 'warning' });
    }
  };

  const handleAddGuest = () => {
    if (guestName.trim() && canStageMoreUsers) {
      const guestId = `guest:${guestName.trim()}`;
      setStagedForAdditionUserIds(prevIds => new Set(prevIds).add(guestId));
      setGuestName('');
    } else if (!canStageMoreUsers) {
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

  return (
    <div className="mt-6">
      {fetchAllUsersError && <p className="text-red-500 text-center mt-4">Lỗi tải người dùng: {fetchAllUsersError}</p>}
      <div className="flex flex-col md:flex-row md:space-x-6">
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
                disabled={!canStageMoreUsers}
              />
            ))}
          </div>
        </div>

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
      <div className="mt-6 flex items-center gap-4">
        <div className="flex-grow">
          <Input
            type="text"
            placeholder="Nhập tên thành viên khách"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleAddGuest}
          disabled={!guestName.trim() || !canStageMoreUsers}
        >
          Thêm khách
        </Button>
      </div>
    </div>
  );
}
