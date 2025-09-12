'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [link, setLink] = useState('');
  
  const [status, setStatus] = useState({ type: '', message: '' });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Fetch all users to populate the dropdown
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          setStatus({ type: 'error', message: 'Не удалось загрузить список пользователей.' });
        }
      } catch (error) {
        setStatus({ type: 'error', message: `Ошибка при загрузке пользователей: ${error.message}` });
      }
    };
    fetchUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus({ type: '', message: '' });

    if (!selectedUserId || !title || !message) {
      setStatus({ type: 'error', message: 'Пожалуйста, выберите пользователя и заполните заголовок и сообщение.' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          title,
          message,
          link,
          type: 'SYSTEM', // Sent from admin panel
        }),
      });

      if (response.ok) {
        setStatus({ type: 'success', message: 'Уведомление успешно отправлено!' });
        // Clear form
        setSelectedUserId('');
        setTitle('');
        setMessage('');
        setLink('');
      } else {
        const errorData = await response.json();
        setStatus({ type: 'error', message: `Не удалось отправить уведомление: ${errorData.message}` });
      }
    } catch (error) {
      setStatus({ type: 'error', message: `Произошла ошибка: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const userOptions = users.map(user => ({
    value: user.id,
    label: `${user.name} (${user.email})`,
  }));

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl font-bold mb-6">Отправить уведомление</h1>
      
      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
            Пользователь
          </label>
          <Select
            id="user"
            options={[{ value: '', label: 'Выберите пользователя...' }, ...userOptions]}
            value={selectedUserId}
            onChange={(e) => setSelectedUserId(e.target.value)}
            disabled={users.length === 0}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Заголовок
          </label>
          <Input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Важное обновление"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
            Сообщение
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="4"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Текст вашего сообщения..."
          ></textarea>
        </div>

        <div className="mb-6">
          <label htmlFor="link" className="block text-sm font-medium text-gray-700 mb-1">
            Ссылка (необязательно)
          </label>
          <Input
            id="link"
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="/dashboard"
          />
        </div>

        {status.message && (
          <div className="mb-4">
            <Alert type={status.type}>{status.message}</Alert>
          </div>
        )}

        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Отправка...' : 'Отправить уведомление'}
        </Button>
      </form>
    </div>
  );
}
