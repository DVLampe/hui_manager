'use client';

import { useState } from 'react';
import Chat from './Chat'; // Assuming Chat.jsx is in the same directory
import { MessageSquare } from 'lucide-react'; // Using lucide-react for icons

const ChatModal = ({ huiId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Icon Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110"
          aria-label="Open chat"
        >
          <MessageSquare size={28} />
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-5 z-50 w-[400px] h-[600px] shadow-2xl rounded-lg">
           <div className="flex flex-col h-full">
             <div className="bg-indigo-600 text-white p-3 rounded-t-lg flex justify-between items-center">
               <h3 className="font-bold text-lg">Group Chat</h3>
               <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">&times;</button>
             </div>
             <div className="flex-grow min-h-0">
              <Chat huiId={huiId} />
             </div>
           </div>
        </div>
      )}
    </>
  );
};

export default ChatModal;
