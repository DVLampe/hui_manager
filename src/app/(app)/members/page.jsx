'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Loading from '@/components/ui/Loading';
import Alert from '@/components/ui/Alert';
import Input from '@/components/ui/Input';
import { useToast } from '@/components/ui/Toaster';
import { UserPlusIcon, UserGroupIcon } from '@heroicons/react/24/outline';

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
  const [activeTab, setActiveTab] = useState('friendsList'); // 'friendsList' or 'requests'
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
      <div className="flex h-full bg-gray-50">
        {/* Left Sidebar for Tabs */}
        <aside className="w-1/4 bg-white p-4 border-r">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Bạn bè</h2>
            <Button variant="primary" size="sm" onClick={() => setIsAddFriendModalOpen(true)}>
              Thêm bạn
            </Button>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab('friendsList')}
              className={`w-full text-left flex items-center p-2 rounded-md ${activeTab === 'friendsList' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              <UserGroupIcon className="h-5 w-5 mr-3" />
              Danh sách bạn bè
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`w-full text-left flex items-center p-2 rounded-md ${activeTab === 'requests' ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'}`}
            >
              <UserPlusIcon className="h-5 w-5 mr-3" />
              Lời mời kết bạn
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="w-3/4 p-6">
          {activeTab === 'friendsList' && <FriendsList friends={friends} />}
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
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  const sortedAndFilteredFriends = useMemo(() => {
    return friends
      .filter(friend => friend.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        if (sortOrder === 'asc') {
          return a.name.localeCompare(b.name);
        } else {
          return b.name.localeCompare(a.name);
        }
      });
  }, [friends, searchTerm, sortOrder]);

  const groupedFriends = useMemo(() => {
    return sortedAndFilteredFriends.reduce((acc, friend) => {
      const firstLetter = friend.name[0].toUpperCase();
      if (!acc[firstLetter]) {
        acc[firstLetter] = [];
      }
      acc[firstLetter].push(friend);
      return acc;
    }, {});
  }, [sortedAndFilteredFriends]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Danh sách bạn bè ({friends.length})</h1>
      <div className="flex items-center gap-4 mb-4 p-4 bg-white rounded-md shadow-sm">
        <Input
          type="text"
          placeholder="Tìm bạn..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-grow"
        />
        <Button variant="outline" onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
          Tên {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
        </Button>
      </div>
      {Object.keys(groupedFriends).map(letter => (
        <div key={letter}>
          <h2 className="text-lg font-semibold my-2">{letter}</h2>
          <ul className="space-y-2">
            {groupedFriends[letter].map(friend => (
              <li key={friend.id} className="p-3 bg-white rounded shadow-sm flex items-center">
                <div className="w-10 h-10 bg-gray-300 rounded-full mr-4"></div> {/* Placeholder for avatar */}
                {friend.name}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Component for the Friend Requests Tab
const FriendRequests = ({ pendingRequests, sentRequests, onAction }) => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Lời mời kết bạn</h1>
      <div className="bg-white p-6 rounded-md shadow-sm mb-6">
        <h2 className="text-xl font-semibold mb-4">Lời mời đã nhận ({pendingRequests.length})</h2>
        {pendingRequests.length > 0 ? (
          <ul className="space-y-3">
            {pendingRequests.map(req => (
              <li key={req.id} className="flex justify-between items-center">
                <span className="text-sm font-medium">{req.requester.name}</span>
                <div>
                  <Button onClick={() => onAction(req.id, 'ACCEPTED')} variant="primary" size="sm" className="mr-2">Chấp nhận</Button>
                  <Button onClick={() => onAction(req.id, 'DECLINED')} variant="danger" size="sm">Từ chối</Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-8">
            <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full flex items-center justify-center">
               {/* Placeholder for mailbox icon */}
            </div>
            <p className="mt-4 text-gray-500">Bạn không có lời mời nào</p>
          </div>
        )}
      </div>
      <div className="bg-white p-6 rounded-md shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Lời mời đã gửi ({sentRequests.length})</h2>
        {sentRequests.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {sentRequests.map(req => (
              <li key={req.id} className="p-3 border rounded-md flex flex-col items-center text-center bg-gray-50">
                 <div className="w-12 h-12 bg-gray-300 rounded-full mb-2"></div> {/* Placeholder for avatar */}
                <p className="font-medium text-sm">{req.addressee.name}</p>
                <p className="text-xs text-gray-500 mb-2">Đã gửi lời mời</p>
                <Button onClick={() => onAction(req.id, 'CANCELLED')} variant="secondary" size="sm">Thu hồi lời mời</Button>
              </li>
            ))}
          </ul>
        ) : (
           <p className="text-gray-500">Không có lời mời nào đã gửi.</p>
        )}
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
      onFriendRequestSent(); // Callback to refresh the main page
      onClose(); // Close the modal
    } catch (err) {
      showToast({ message: err.message, type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">Thêm bạn</h2>
        <form onSubmit={handleSearch}>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Tìm theo email hoặc số điện thoại..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? 'Đang tìm...' : 'Tìm kiếm'}
            </Button>
          </div>
        </form>
        <div className="mt-4 max-h-60 overflow-y-auto">
          {searchResults.map(user => (
            <div key={user.id} className="flex justify-between items-center p-2 hover:bg-gray-100 rounded">
              <div>
                <p className="font-semibold">{user.name}</p>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button size="sm" onClick={() => handleSendRequest(user.id)}>Gửi lời mời</Button>
            </div>
          ))}
        </div>
        <div className="mt-4 text-right">
          <Button variant="secondary" onClick={onClose}>Đóng</Button>
        </div>
      </div>
    </div>
  );
};
