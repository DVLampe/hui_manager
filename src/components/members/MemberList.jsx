import { t } from '@/lib/translations';

export default function MemberList({ members, onDeleteMember, canManage }) {
  if (!members || members.length === 0) {
    return <p>Chưa có thành viên nào.</p>;
  }

  const handleDelete = (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) {
      onDeleteMember(memberId);
    }
  };

  return (
    <div className="space-y-3">
      {members.map(member => (
        <div key={member.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-bold">
              {(member.user?.name || member.guestName || 'N/A').charAt(0)}
            </div>
            <div>
              <p className="font-medium text-gray-800">{member.user?.name || member.guestName || 'N/A'}</p>
              <p className="text-sm text-gray-500">{member.user?.email || 'Guest'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {canManage && (
              <button className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded-md hover:bg-red-50 transition-colors" onClick={() => handleDelete(member.id)}>
                Xóa
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
