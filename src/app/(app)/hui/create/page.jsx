'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NumberInput from '@/components/ui/NumberInput';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import AddMembersPanel from '@/components/hui/AddMembersPanel';

export default function CreateHuiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    startDate: '',
    endDate: '',
    frequency: 'MONTHLY',
    numberOfPeriods: '',
  });
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?redirect=/hui/create');
    }
  }, [status, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError('');
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!formData.name || !formData.amount || !formData.startDate || !formData.frequency || !formData.numberOfPeriods) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc.');
      setLoading(false);
      return;
    }
    
    const dataToSubmit = {
      ...formData,
      members,
    };

    try {
      const response = await fetch('/api/hui', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToSubmit),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create Hui');
      }

      const newHui = await response.json();
      router.push(`/hui/${newHui.id}`);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') { 
    return (
        <div className="container mx-auto px-4 py-8 text-center">
            <Loading />
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white p-6 md:p-8 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-8 text-center text-gray-700">Tạo Hụi Mới</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Tên hụi <span className="text-red-500">*</span></label>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Hụi Tết 2025"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả ngắn về mục đích hoặc quy định của hụi..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">Số tiền mỗi kỳ (VNĐ) <span className="text-red-500">*</span></label>
              <NumberInput
                id="amount"
                name="amount"
                required
                value={formData.amount}
                onChange={handleChange}
                placeholder="VD: 1000000"
                min="0"
              />
            </div>
            <div>
              <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 mb-1">Loại hụi <span className="text-red-500">*</span></label>
              <Select
                id="frequency"
                name="frequency"
                required
                value={formData.frequency}
                onChange={handleChange}
                options={[
                  { value: 'DAILY', label: 'Hụi ngày' },
                  { value: 'WEEKLY', label: 'Hụi tuần' },
                  { value: 'MONTHLY', label: 'Hụi tháng' },
                ]}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu <span className="text-red-500">*</span></label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc (tùy chọn)</label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                value={formData.endDate}
                onChange={handleChange}
                min={formData.startDate} 
              />
            </div>
          </div>

          <div>
            <label htmlFor="numberOfPeriods" className="block text-sm font-medium text-gray-700 mb-1">Số kỳ <span className="text-red-500">*</span></label>
            <Input
              id="numberOfPeriods"
              name="numberOfPeriods"
              type="number"
              required
              value={formData.numberOfPeriods}
              onChange={handleChange}
              placeholder="VD: 10"
              min="1"
            />
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">Thêm thành viên</h2>
            <AddMembersPanel
              onStagedMembersChange={setMembers}
              totalMembers={formData.numberOfPeriods}
            />
          </div>
          
          {error && <Alert type="error" message={error} />}

          <div className="flex items-center justify-end space-x-4 pt-4">
            <Link href="/hui">
                <Button type="button" variant="secondary" disabled={loading}>
                    Hủy
                </Button>
            </Link>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading ? <Loading size="sm" /> : 'Tạo Hụi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
