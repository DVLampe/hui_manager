'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageCircle, X, Send } from 'lucide-react';

const DynamicChat = dynamic(() => import('@/components/chat/Chat'), {
  loading: () => <p className="p-4 text-center text-gray-500">Loading chat...</p>,
  ssr: false
});

export default function MobileChatModal({ huiId }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-20 right-4 w-14 h-14 bg-red-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-end transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={() => setIsOpen(false)}
    >
      <div 
        className={`bg-white w-full rounded-t-2xl shadow-lg flex flex-col transition-transform duration-300 ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ height: '85%', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
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
  );
}
