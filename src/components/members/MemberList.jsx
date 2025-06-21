import Button from '../ui/Button'; // Assuming you have a Button component

export default function MemberList({ members, onDeleteMember }) {
  if (!members || members.length === 0) {
    return <p>Chưa có thành viên nào.</p>;
  }

  const handleDelete = (memberId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa thành viên này không?')) {
      onDeleteMember(memberId);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.id || member.userId}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-grow">
                  <p className="text-sm font-medium text-indigo-600 truncate">
                    {member.user?.name || 'N/A'} ({member.user?.email || 'N/A'})
                  </p>
                  <p className="text-sm text-gray-500">
                    Ngày tham gia: {member.joinedAt ? new Date(member.joinedAt).toLocaleDateString('vi-VN') : 'N/A'}
                  </p>
                </div>
                <div className="ml-2 flex-shrink-0">
                  <Button 
                    variant="danger" 
                    size="sm"
                    onClick={() => handleDelete(member.id)}
                  >
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
