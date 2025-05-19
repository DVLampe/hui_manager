// src/components/members/MemberList.jsx
export default function MemberList({ members }) {
  if (!members || members.length === 0) {
    return <p>Chưa có thành viên nào.</p>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" className="divide-y divide-gray-200">
        {members.map((member) => (
          <li key={member.id || member.userId}>
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-indigo-600 truncate">
                  {member.user?.name || 'N/A'} ({member.user?.email || 'N/A'})
                </p>
                <div className="ml-2 flex-shrink-0 flex">
                  <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${member.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {member.status || 'PENDING'}
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:flex sm:justify-between">
                <div className="sm:flex">
                  <p className="flex items-center text-sm text-gray-500">
                    Ngày tham gia: {member.joinDate ? new Date(member.joinDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
