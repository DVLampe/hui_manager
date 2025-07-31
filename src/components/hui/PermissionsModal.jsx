import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Select from '@/components/ui/Select';

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
      const response = await fetch('/api/users');
      const data = await response.json();
      setAllUsers(data);
    };
    fetchUsers();
  }, []);

  const handleAddPermission = () => {
    if (selectedUser && !permissions.some(p => p.userId === selectedUser)) {
      const user = allUsers.find(u => u.id === selectedUser);
      setPermissions([...permissions, { userId: selectedUser, user: { name: user.name } }]);
    }
  };

  const handleRemovePermission = (userId) => {
    setPermissions(permissions.filter(p => p.userId !== userId));
  };

  const handleSave = () => {
    onSave(permissions);
  };

  const userOptions = allUsers.map(user => ({ value: user.id, label: user.name }));

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Quản lý quyền">
      <div className="space-y-4">
        <div>
          <h4 className="font-medium">Thêm người quản lý</h4>
          <div className="flex items-center space-x-2 mt-2">
            <Select
              options={userOptions}
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="w-full"
            />
            <Button onClick={handleAddPermission}>Thêm</Button>
          </div>
        </div>
        <div>
          <h4 className="font-medium">Người có quyền quản lý</h4>
          <ul className="mt-2 space-y-2">
            {permissions.map(p => (
              <li key={p.userId} className="flex items-center justify-between p-2 bg-gray-100 rounded">
                <span>{p.user?.name}</span>
                <Button variant="danger" size="sm" onClick={() => handleRemovePermission(p.userId)}>Xóa</Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Hủy</Button>
        <Button variant="primary" onClick={handleSave}>Lưu</Button>
      </div>
    </Modal>
  );
}
