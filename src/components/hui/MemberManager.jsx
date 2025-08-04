'use client';
import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import { TrashIcon } from '@heroicons/react/24/outline';

export default function MemberManager({ initialMembers = [], onMembersChange }) {
  const [members, setMembers] = useState(initialMembers);
  const [newMemberId, setNewMemberId] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      try {
        setLoading(true);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const users = await response.json();
        setAllUsers(users);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  useEffect(() => {
    onMembersChange(members);
  }, [members, onMembersChange]);

  const handleAddMember = () => {
    if (newMemberId && !members.some(m => m.userId === newMemberId)) {
      const user = allUsers.find(u => u.id === newMemberId);
      if (user) {
        setMembers([...members, { userId: user.id, user: { name: user.name } }]);
        setNewMemberId('');
      }
    }
  };

  const handleRemoveMember = (userId) => {
    setMembers(members.filter(m => m.userId !== userId));
  };

  const userOptions = allUsers
    .filter(user => !members.some(m => m.userId === user.id))
    .map(user => ({ value: user.id, label: user.name }));

  return (
    <div>
      <div className="space-y-4">
        {members.map((member, index) => (
          <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-md">
            <span className="text-sm font-medium text-gray-800">{member.user.name}</span>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => handleRemoveMember(member.userId)}
            >
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex-grow">
          <Select
            value={newMemberId}
            onChange={(e) => setNewMemberId(e.target.value)}
            options={[{ value: '', label: 'Chọn thành viên' }, ...userOptions]}
            disabled={loading}
          />
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={handleAddMember}
          disabled={!newMemberId || loading}
        >
          Thêm
        </Button>
      </div>
    </div>
  );
}
