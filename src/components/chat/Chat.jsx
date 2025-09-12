'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import io from 'socket.io-client';
import { Paperclip, Send, Smile } from 'lucide-react'; // Icons
import EmojiPicker from 'emoji-picker-react';

const Chat = ({ huiId }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!huiId) return;

    const newSocket = io('http://localhost:3001');
    setSocket(newSocket);

    newSocket.emit('joinRoom', huiId);

    newSocket.on('messageHistory', (history) => setMessages(history));
    newSocket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => newSocket.close();
  }, [huiId]);

  const onEmojiClick = (emojiObject) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !session?.user?.id) return;

    setUploading(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, fileType: file.type, fileSize: file.size }),
      });

      if (!res.ok) throw new Error((await res.json()).error || 'Failed to get presigned URL');
      
      const { uploadUrl, fileUrl } = await res.json();

      await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });

      socket.emit('sendMessage', {
        huiId,
        userId: session.user.id,
        fileUrl,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
      });

    } catch (error) {
      console.error('File upload error:', error);
      alert(`Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
      if(fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && session?.user?.id && socket) {
      socket.emit('sendMessage', {
        huiId,
        content: newMessage,
        userId: session.user.id,
      });
      setNewMessage('');
    }
  };

  const renderMessageContent = (msg) => {
    if (msg.fileUrl) {
      if (msg.fileType?.startsWith('image/')) {
        return (
          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
            <img src={msg.fileUrl} alt={msg.fileName} className="rounded-lg max-w-full h-auto mt-1" />
            <p className="text-sm mt-1">{msg.fileName}</p>
          </a>
        );
      }
      return (
        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-200 hover:underline">
          {msg.fileName} ({Math.round(msg.fileSize / 1024)} KB)
        </a>
      );
    }
    return <p className="whitespace-pre-wrap">{msg.content}</p>;
  };

  return (
    <div className="flex flex-col h-full bg-white shadow">
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex mb-3 ${msg.userId === session?.user?.id ? 'justify-end' : 'justify-start'}`}>
            <div className={`rounded-lg px-4 py-2 max-w-xs lg:max-w-md ${msg.userId === session?.user?.id ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
              <p className="font-bold text-sm">{msg.user.name}</p>
              {renderMessageContent(msg)}
              <p className="text-xs text-right opacity-70 mt-1">{new Date(msg.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          </div>
        ))}
        {uploading && <p className="text-center text-gray-500">Uploading file...</p>}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="relative">
        {showEmojiPicker && (
          <div className="absolute bottom-full right-0 z-10">
            <EmojiPicker onEmojiClick={onEmojiClick} />
          </div>
        )}
        <form onSubmit={sendMessage} className="flex items-center p-2 border-t bg-white">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
          <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2 text-gray-500 hover:text-indigo-500" disabled={uploading}>
            <Paperclip size={24} />
          </button>
          <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 text-gray-500 hover:text-indigo-500">
            <Smile size={24} />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 mx-2 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Nhập tin nhắn..."
            disabled={!socket || uploading}
          />
          <button type="submit" className="p-2 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 disabled:bg-indigo-300" disabled={!socket || (!newMessage.trim() && !uploading)}>
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat;
