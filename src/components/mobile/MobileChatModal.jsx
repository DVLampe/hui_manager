'use client';
import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

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
    <div className="fixed inset-0 bg-white z-50 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-lg font-bold">Chat</h2>
        <button onClick={() => setIsOpen(false)}><X /></button>
      </div>
      <div className="flex-grow p-4 overflow-y-auto">
        {/* Chat messages will go here */}
        <p className="text-center text-gray-500">Chat feature is not implemented yet.</p>
      </div>
      <div className="p-4 border-t border-gray-200 flex items-center gap-2">
        <input type="text" placeholder="Type a message..." className="flex-grow border rounded-full px-4 py-2" />
        <button className="p-3 bg-red-600 text-white rounded-full">
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
