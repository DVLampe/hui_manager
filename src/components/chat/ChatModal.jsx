'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { MessageSquare } from 'lucide-react';
import Draggable from 'react-draggable';

const DynamicChat = dynamic(() => import('./Chat'), {
  loading: () => <p className="p-4">Loading chat...</p>,
  ssr: false
});

const ChatModal = ({ huiId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Icon Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-gradient-to-br from-red-600 to-red-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-40"
      >
        <MessageSquare className="w-6 h-6" />
      </button>

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
