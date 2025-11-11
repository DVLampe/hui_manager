'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toaster';
import { UserPlus, UserGroupIcon, Users, Search, ArrowUpDown, Check, X, ChevronRight } from 'lucide-react';

// Main component for the Friends/Members page
export default function FriendsPage() {
  const { status } = useSession();
  const { showToast } = useToast();
  
  // State for data
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  
  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('friends'); // 'friends' or 'requests'
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);

  // Data fetching
  const fetchFriendsData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends data');
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setSentRequests(data.sentRequests || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchFriendsData();
    }
  }, [status]);

  // Handlers for friend actions
  const handleRequestResponse = async (friendshipId, newStatus) => {
    try {
        const method = newStatus === 'CANCELLED' ? 'DELETE' : 'PUT';
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (method === 'PUT') {
            options.body = JSON.stringify({ status: newStatus });
        }

      const response = await fetch(`/api/friends/${friendshipId}`, options);
      if (!response.ok) throw new Error(`Failed to ${newStatus.toLowerCase()} request`);
      showToast({ message: `Request ${newStatus.toLowerCase()}ed.`, type: 'success' });
      fetchFriendsData();
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    }
  };

  // Render logic
  if (loading) return <Loading message="Đang tải..." />;
  if (error) return <Alert type="error" message={error} />;

  return (
    <>
      <AddFriendModal
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onFriendRequestSent={fetchFriendsData}
      />
      <div className="flex gap-6">
        <aside className="w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Bạn bè</h2>
            <button 
              onClick={() => setIsAddFriendModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mb-4 font-medium"
            >
              <UserPlus className="w-4 h-4" />
              Thêm bạn
            </button>
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('friends')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'friends'
                    ? 'bg-red-50 text-red-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Danh sách bạn bè</span>
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTab('requests')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'requests'
                    ? 'bg-red-50 text-red-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>Lời mời kết bạn</span>
                {(pendingRequests.length + sentRequests.length) > 0 && (
                  <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {pendingRequests.length + sentRequests.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </aside>
        <main className="flex-1">
          {activeTab === 'friends' && <FriendsList friends={friends} />}
          {activeTab === 'requests' && (
            <FriendRequests
              pendingRequests={pendingRequests}
              sentRequests={sentRequests}
              onAction={handleRequestResponse}
            />
          )}
        </main>
      </div>
    </>
  );
}

// Component for the Friends List Tab
const FriendsList = ({ friends }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortAZ, setSortAZ] = useState(true);

  const sortedAndFilteredFriends = useMemo(() => {
    return friends
      .filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => sortAZ ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name));
  }, [friends, searchTerm, sortAZ]);

  const groupedFriends = useMemo(() => {
    return sortedAndFilteredFriends.reduce((acc, friend) => {
      const firstLetter = friend.name[0].toUpperCase();
      if (!acc[firstLetter]) acc[firstLetter] = [];
      acc[firstLetter].push(friend);
      return acc;
    }, {});
  }, [sortedAndFilteredFriends]);

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Danh sách bạn bè ({friends.length})</h2>
          <button onClick={() => setSortAZ(!sortAZ)} className="flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
            <ArrowUpDown className="w-4 h-4" />
            <span className="text-sm font-medium">{sortAZ ? 'A → Z' : 'Z → A'}</span>
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input type="text" placeholder="Tìm kiếm bạn bè..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
        </div>
      </div>
      <div className="p-6">
        {Object.keys(groupedFriends).sort().map(letter => (
          <div key={letter} className="mb-6">
            <h3 className="text-sm font-bold text-gray-500 mb-3 px-2">{letter}</h3>
            <div className="space-y-2">
              {groupedFriends[letter].map(friend => (
                <div key={friend.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
                      {friend.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{friend.name}</p>
                      <p className="text-sm text-gray-500">{friend.email}</p>
                    </div>
                  </div>
                  <button className="text-red-600 hover:text-red-700 text-sm font-medium">Xem hồ sơ</button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Component for the Friend Requests Tab
const FriendRequests = ({ pendingRequests, sentRequests, onAction }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Lời mời đã nhận ({pendingRequests.length})</h2>
        </div>
        <div className="p-6 space-y-3">
          {pendingRequests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  {req.requester.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{req.requester.name}</p>
                  <p className="text-sm text-gray-500">{req.requester.email}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => onAction(req.id, 'ACCEPTED')} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                  <Check className="w-4 h-4" />
                  Chấp nhận
                </button>
                <button onClick={() => onAction(req.id, 'DECLINED')} className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <X className="w-4 h-4" />
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">Lời mời đã gửi ({sentRequests.length})</h2>
        </div>
        <div className="p-6 space-y-3">
          {sentRequests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center text-white font-bold">
                  {req.addressee.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-800">{req.addressee.name}</p>
                  <p className="text-sm text-gray-500">{req.addressee.email}</p>
                </div>
              </div>
              <button onClick={() => onAction(req.id, 'CANCELLED')} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                Thu hồi lời mời
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Component for the Add Friend Modal
const AddFriendModal = ({ isOpen, onClose, onFriendRequestSent }) => {
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    try {
      const response = await fetch(`/api/users?search=${searchQuery}`);
      if (!response.ok) throw new Error('Failed to search for users.');
      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async (addresseeId) => {
    try {
      const response = await fetch('/api/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresseeId }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send friend request');
      }

      showToast({ message: 'Friend request sent!', type: 'success' });
      onFriendRequestSent();
      onClose();
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Thêm bạn</h2>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <form onSubmit={handleSearch} className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Email hoặc số điện thoại</label>
            <input type="text" placeholder="Nhập email hoặc số điện thoại" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
            <button type="submit" disabled={isSearching} className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium">
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </button>
          </form>
          <div className="border-t border-gray-200 pt-4">
            <p className="text-sm text-gray-500 mb-3">Kết quả tìm kiếm</p>
            <div className="space-y-2">
              {searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button onClick={() => handleSendRequest(user.id)} className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                    Gửi lời mời
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-gray-200">
          <button onClick={onClose} className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
