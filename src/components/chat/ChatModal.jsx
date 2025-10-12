'use client';

import { useState } from 'react';
import Chat from './Chat';
import { MessageSquare } from 'lucide-react';
import Draggable from 'react-draggable';

const ChatModal = ({ huiId }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Icon Button */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="bg-blue-500 text-white rounded-full p-4 shadow-lg hover:bg-blue-600 transition-transform transform hover:scale-110"
          aria-label="Open chat"
        >
          <MessageSquare size={28} />
        </button>
      </div>

      {/* Chat Window */}
      {isOpen && (
        <Draggable handle=".chat-handle">
          <div className="fixed bottom-20 right-5 z-50 w-[400px] h-[600px] shadow-2xl rounded-lg bg-white">
             <div className="flex flex-col h-full">
               <div className="chat-handle bg-blue-500 text-white p-3 rounded-t-lg flex justify-between items-center cursor-move">
                 <h3 className="font-bold text-lg">Group Chat</h3>
                 <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200 cursor-pointer text-2xl font-bold">&times;</button>
               </div>
               <div className="flex-grow min-h-0">
                <Chat huiId={huiId} />
               </div>
             </div>
          </div>
        </Draggable>
      )}
    </>
  );
};

export default ChatModal;
