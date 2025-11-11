'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useIsMobile } from '@/lib/hooks';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import NumberInput from '@/components/ui/NumberInput';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Loading from '@/components/ui/Loading';
import Link from 'next/link';
import AddMembersPanel from '@/components/hui/AddMembersPanel';
import { Search, CheckCircle } from 'lucide-react';

export default function CreateHuiPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === 'authenticated';
  const isMobile = useIsMobile();

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
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?redirect=/hui/create');
    }
    if (status === 'authenticated') {
      const fetchFriends = async () => {
        try {
          const response = await fetch('/api/friends');
          if (!response.ok) {
            throw new Error('Failed to fetch friends');
          }
          const data = await response.json();
          setFriends(data.friends);
        } catch (err) {
          console.error(err);
        }
      };
      fetchFriends();
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
    <div>
      {!isMobile && (
        <div className="mb-8">
          <Link href="/hui">
            <button className="text-gray-600 hover:text-gray-800 mb-4">
              ← Quay lại
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">Tạo Hụi Mới</h1>
          <p className="text-gray-500 mt-1">Điền thông tin để tạo hụi mới</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className={`grid grid-cols-1 ${!isMobile ? 'lg:grid-cols-2 gap-8' : 'gap-4'}`}>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-6">Thông tin cơ bản</h2>
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên hụi <span className="text-red-600">*</span></label>
                <Input id="name" name="name" type="text" required value={formData.name} onChange={handleChange} placeholder="VD: Hụi Tết 2025" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea id="description" name="description" rows="4" value={formData.description} onChange={handleChange} placeholder="Mô tả về hụi này..." className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
              <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-2' : ''} gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Số tiền mỗi kỳ <span className="text-red-600">*</span></label>
                  <NumberInput id="amount" name="amount" required value={formData.amount} onChange={handleChange} placeholder="0" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Loại hụi <span className="text-red-600">*</span></label>
                  <Select id="frequency" name="frequency" required value={formData.frequency} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-white" options={[{ value: 'DAILY', label: 'Ngày' }, { value: 'WEEKLY', label: 'Tuần' }, { value: 'MONTHLY', label: 'Tháng' }]} />
                </div>
              </div>
              <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-2' : ''} gap-4`}>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu <span className="text-red-600">*</span></label>
                  <Input id="startDate" name="startDate" type="date" required value={formData.startDate} onChange={handleChange} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
                  <Input id="endDate" name="endDate" type="date" value={formData.endDate} onChange={handleChange} min={formData.startDate} className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số kỳ <span className="text-red-600">*</span></label>
                <Input id="numberOfPeriods" name="numberOfPeriods" type="number" required value={formData.numberOfPeriods} onChange={handleChange} placeholder="12" className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500" />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <AddMembersPanel
              onStagedMembersChange={setMembers}
              totalMembers={formData.numberOfPeriods}
              friends={friends}
            />
          </div>
        </div>
        {error && <div className="mt-4"><Alert type="error" message={error} /></div>}
        <div className={`mt-8 flex items-center justify-end gap-4 ${isMobile ? 'p-4' : 'bg-white rounded-xl border border-gray-200 p-6'}`}>
          <Link href="/hui">
            <button type="button" className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium">
              Hủy
            </button>
          </Link>
          <button type="submit" disabled={loading} className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-xl">
            {loading ? 'Đang tạo...' : 'Tạo Hụi'}
          </button>
        </div>
      </form>
    </div>
  );
}
