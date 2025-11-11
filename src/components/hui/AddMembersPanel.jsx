'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toaster';

const UserListItem = ({ user, onAction, actionLabel, disabled }) => {
  const isRemoveAction = actionLabel.includes("Xóa") || actionLabel.includes("Remove");

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-gray-50 border-gray-200 hover:bg-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
          {user.name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-800 text-sm">{user.name}</p>
          <p className="text-xs text-gray-500">{user.email || 'Guest'}</p>
        </div>
      </div>
      <button 
        type="button" 
        className={`px-3 py-1 text-sm font-medium rounded-md ${isRemoveAction ? 'text-red-600 hover:bg-red-50' : 'text-yellow-600 hover:bg-yellow-50'}`}
        onClick={() => onAction(user.id)} 
        disabled={disabled}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default function AddMembersPanel({ onStagedMembersChange, totalMembers, friends = [] }) {
  const { showToast } = useToast();
  const [allUsers, setAllUsers] = useState([]);
  const [loadingAllUsers, setLoadingAllUsers] = useState(false);
  const [fetchAllUsersError, setFetchAllUsersError] = useState(null);
  const [stagedForAdditionUserIds, setStagedForAdditionUserIds] = useState(new Set());
  const [guestName, setGuestName] = useState('');
  const [guestSuggestions, setGuestSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const guestInputRef = useRef(null);

  useEffect(() => {
    const fetchGuestSuggestions = async () => {
      try {
        const response = await fetch('/api/guests');
        if (response.ok) {
          const data = await response.json();
          setGuestSuggestions(data);
        }
      } catch (error) {
        console.error("Failed to fetch guest suggestions:", error);
      }
    };
    fetchGuestSuggestions();
  }, []);

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
    const friendIds = new Set(friends.map(f => f.id));
    const availableFriends = friends.filter(user => !stagedForAdditionUserIds.has(user.id));
    const availableOthers = allUsers.filter(user => !stagedForAdditionUserIds.has(user.id) && !friendIds.has(user.id));
    return [...availableFriends, ...availableOthers];
  }, [allUsers, friends, stagedForAdditionUserIds, loadingAllUsers]);

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

  const handleAddGuest = (name) => {
    const guestNameToAdd = name || guestName.trim();
    if (guestNameToAdd && canStageMoreUsers) {
      const guestId = `guest:${guestNameToAdd}`;
      if (stagedForAdditionUserIds.has(guestId)) {
        showToast({ message: `Khách '${guestNameToAdd}' đã có trong danh sách.`, type: 'warning' });
        return;
      }
      setStagedForAdditionUserIds(prevIds => new Set(prevIds).add(guestId));
      setGuestName('');
      setShowSuggestions(false);
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
      <div className="mt-6 flex items-start gap-4">
        <div className="flex-grow relative" ref={guestInputRef}>
          <Input
            type="text"
            placeholder="Nhập tên thành viên khách"
            value={guestName}
            onChange={(e) => {
              setGuestName(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
          />
          {showSuggestions && guestName && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {guestSuggestions
                .filter(name => name.toLowerCase().includes(guestName.toLowerCase()))
                .map((name, index) => (
                  <div
                    key={index}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => {
                      setGuestName(name);
                      setShowSuggestions(false);
                    }}
                  >
                    {name}
                  </div>
                ))}
            </div>
          )}
        </div>
        <button
          type="button"
          className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          onClick={() => handleAddGuest()}
          disabled={!guestName.trim() || !canStageMoreUsers}
        >
          Thêm khách
        </button>
      </div>
    </div>
  );
}
