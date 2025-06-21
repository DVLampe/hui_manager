'use client';

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
// import { fetchCurrentUser, updateUserProfile } from '@/store/authSlice'; // Assuming you might have such actions
import Card from '@/components/ui/Card'; // Changed to named import
import Button from '@/components/ui/Button'; 
import Input from '@/components/ui/Input'; 

const UserProfilePage = () => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setAvatar(user.avatar || '');
    }
  }, [user]);

  const handleEditToggle = () => {
    if (isEditing) {
      // TODO: Implement save logic
      // dispatch(updateUserProfile({ id: user.id, name, phone, avatar }));
      console.log('Save changes: (not implemented yet)', { name, phone, avatar });
    }
    setIsEditing(!isEditing);
  };

  if (loading) {
    return <div className="container mx-auto p-4"><p>Loading profile...</p></div>;
  }

  if (error) {
    return <div className="container mx-auto p-4"><p className="text-red-500">Error loading profile: {error.message || error}</p></div>;
  }

  if (!user) {
    return <div className="container mx-auto p-4"><p>No user data found. Please log in.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-2xl">
      <Card>
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold leading-6 text-gray-900">User Profile</h2>
          <p className="mt-1 text-sm text-gray-500">View and manage your profile information.</p>
        </div>
        
        <div className="px-6 py-6 space-y-6">
          <div className="flex items-center space-x-4">
            {isEditing ? (
              <Input
                type="text"
                id="avatarUrl"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                placeholder="Avatar URL"
                className="w-20 h-20 text-sm" 
              />
            ) : (
              <img 
                src={avatar || 'https://avatar.vercel.sh/' + (user.email || user.id) + '.png'} 
                alt={user.name || 'User Avatar'} 
                className="w-20 h-20 rounded-full object-cover" 
              />
            )}
            <div>
              {isEditing ? (
                <Input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="text-xl font-semibold" 
                />
              ) : (
                <h2 className="text-xl font-semibold">{name}</h2>
              )}
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <Input id="email" type="email" value={user.email || ''} disabled className="mt-1" />
            </div>
            
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <Input 
                id="phone" 
                type="text" 
                value={isEditing ? phone : (user.phone || 'N/A')} 
                disabled={!isEditing} 
                onChange={(e) => setPhone(e.target.value)} 
                className="mt-1"
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <Input id="role" type="text" value={user.role || 'N/A'} disabled className="mt-1" />
            </div>

            <div>
              <label htmlFor="joinedDate" className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
              <Input 
                id="joinedDate" 
                type="text" 
                value={user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'} 
                disabled 
                className="mt-1"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={handleEditToggle} variant={isEditing ? 'default' : 'outline'}>
              {isEditing ? 'Save Changes' : 'Edit Profile'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserProfilePage;
