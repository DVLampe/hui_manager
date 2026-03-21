'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare, X } from 'lucide-react';
import Draggable from 'react-draggable';

const DynamicChat = dynamic(() => import('./Chat'), {
  loading: () => <p className="p-4">Loading chat...</p>,
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

const ChatModal = ({ huiId, chatAccess = 'allowed' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  const handleToggle = () => {
    if (chatAccess !== 'allowed') {
      setShowAccessModal(true);
      return;
    }
    setIsOpen(!isOpen);
  };

  const accessMsg = ACCESS_MESSAGES[chatAccess];

  return (
    <>
      {/* Chat Icon Button */}
      <button 
        onClick={handleToggle}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

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

      {/* Chat Window */}
      {isOpen && (
        <Draggable handle=".chat-handle">
          <div className="fixed bottom-24 right-8 z-50 w-[400px] h-[600px] shadow-2xl rounded-2xl bg-white border border-gray-200 flex flex-col">
             <div className="chat-handle bg-gray-50 p-4 rounded-t-2xl flex justify-between items-center cursor-move border-b border-gray-200">
               <h3 className="font-bold text-lg text-gray-800">Group Chat</h3>
               <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full">&times;</button>
             </div>
             <div className="flex-grow min-h-0">
              <DynamicChat huiId={huiId} />
             </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default ChatModal;
