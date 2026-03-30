'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { NotebookPen, X } from 'lucide-react';

const DynamicChat = dynamic(() => import('@/components/chat/Chat'), {
  loading: () => <p className="p-4 text-center text-gray-500">Loading chat...</p>,
  ssr: false
});

const ACCESS_MESSAGES = {
  need_login: {
    title: 'Đăng nhập để nhắn tin',
    body: 'Bạn cần đăng nhập để tham gia Group Chat của hụi này.',
    showLogin: true,
  },
  not_member: {
    title: 'Không thể nhắn tin',
    body: 'Bạn không phải thành viên của hụi này nên không thể nhắn tin trong Group Chat.',
    showLogin: false,
  },
};

export default function MobileChatModal({ huiId, chatAccess = 'allowed' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const handleOpen = () => {
    if (chatAccess !== 'allowed') {
      setShowAccessModal(true);
      return;
    }
    setIsOpen(true);
  };

  const accessMsg = ACCESS_MESSAGES[chatAccess];

  return (
    <>
      {/* Access Denied Modal */}
      {showAccessModal && accessMsg && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-gray-800">{accessMsg.title}</h3>
              <button onClick={() => setShowAccessModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-6 text-sm">{accessMsg.body}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAccessModal(false)}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                Đóng
              </button>
              {accessMsg.showLogin && (
                <button
                  onClick={() => { window.location.href = '/login'; }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {!isOpen && (
        <button 
          onClick={handleOpen}
          className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
        >
          <NotebookPen className="w-6 h-6" />
        </button>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white w-full rounded-t-2xl shadow-lg flex flex-col"
            style={{ height: '85%', maxHeight: '85vh' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-bold text-gray-800">Group Chat</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-grow min-h-0">
              <DynamicChat huiId={huiId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

