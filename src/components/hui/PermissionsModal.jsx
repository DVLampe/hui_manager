import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function PermissionsModal({ isOpen, onClose, hui, onSave }) {
  const [permissions, setPermissions] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    if (hui) {
      setPermissions(hui.permissions.filter(p => p.permission === 'MANAGE'));
    }
  }, [hui]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users for permissions modal...');
        const response = await fetch('/api/users');
        console.log('Users API response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Users API response data:', data);
          if (Array.isArray(data)) {
            setAllUsers(data);
            console.log('Set allUsers:', data);
          } else {
            console.error("API response for users is not an array:", data);
            setAllUsers([]);
          }
        } else {
          console.error("Failed to fetch users:", response.statusText);
          setAllUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setAllUsers([]);
      }
    };
    if (isOpen) { // Only fetch when modal is open
      fetchUsers();
    }
  }, [isOpen]);

  const handleAddPermission = () => {
    console.log('handleAddPermission called');
    console.log('selectedUser:', selectedUser);
    console.log('allUsers:', allUsers);
    console.log('permissions:', permissions);
    
    if (!selectedUser) {
      alert('Vui lòng chọn người dùng trước khi thêm!');
      return;
    }
    
    if (permissions.some(p => p.userId === selectedUser)) {
      alert('Người dùng này đã có quyền quản lý!');
      return;
    }
    
    const user = allUsers.find(u => u.id === selectedUser);
    if (user) {
      setPermissions([...permissions, { userId: selectedUser, user: { name: user.name } }]);
      setSelectedUser(''); // Reset selection after adding
    } else {
      alert('Không tìm thấy thông tin người dùng!');
    }
  };

  const handleRemovePermission = (userId) => {
    setPermissions(permissions.filter(p => p.userId !== userId));
  };

  const handleSave = () => {
    onSave(permissions);
  };

  const userOptions = Array.isArray(allUsers) ? allUsers.map(user => ({ value: user.id, label: user.name })) : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quản lý quyền">
      <div className="space-y-6 p-2">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Thêm người quản lý</label>
          <div className="flex items-center gap-3">
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="">-- Chọn người dùng --</option>
              {userOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button onClick={handleAddPermission} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">Thêm</button>
          </div>
        </div>
        <div>
          <h4 className="font-medium text-gray-800">Người có quyền quản lý</h4>
          <ul className="mt-3 space-y-3">
            {permissions.map(p => (
              <li key={p.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <span className="font-medium text-gray-800">{p.user?.name}</span>
                <button className="text-red-600 hover:text-red-800 text-sm font-medium" onClick={() => handleRemovePermission(p.userId)}>Xóa</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-200">
        <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium" onClick={onClose}>Hủy</button>
        <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium" onClick={handleSave}>Lưu</button>
      </div>
    </Modal>
  );
}
