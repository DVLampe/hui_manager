'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { cn } from '@/lib/utils'
import {
    HomeIcon,
    UsersIcon,
    CreditCardIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    UserGroupIcon,
    CogIcon,
    ArrowLeftOnRectangleIcon,
    UserCircleIcon,
    BellIcon,
} from '@heroicons/react/24/outline'

const navigationItems = [
	{ name: 'Dashboard', href: '/dashboard', icon: HomeIcon, adminOnly: false },
	{ name: 'Hui Groups', href: '/hui', icon: UserGroupIcon, adminOnly: false },
	{ name: 'Members', href: '/members', icon: UsersIcon, adminOnly: false },
	{ name: 'Statistics', href: '/admin/statistics', icon: ChartBarIcon, adminOnly: true },
	{ name: 'Users', href: '/admin/users', icon: UserCircleIcon, adminOnly: true },
	{ name: 'Notifications', href: '/admin/notifications', icon: BellIcon, adminOnly: true },
]

const bottomLinks = [
    { name: 'Settings', href: '/settings', icon: CogIcon },
]

export default function Sidebar() {
	const pathname = usePathname()
	const { data: session, status } = useSession()
    const user = session?.user
	const isLoading = status === 'loading'
	const isAdmin = user?.role === 'ADMIN'

	const filteredNavigation = navigationItems.filter(item => {
		if (item.adminOnly) {
			return isAdmin;
		}
		return true;
	});

    if (isLoading) {
        return (
            <aside className="w-64 bg-white border-r border-gray-200 h-screen p-4">
                <div className="h-8 w-32 bg-gray-200 rounded-md animate-pulse mb-10"></div>
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-10 w-full bg-gray-200 rounded-md animate-pulse"></div>
                    ))}
                </div>
            </aside>
        );
    }

	return (
		<aside className="w-64 bg-white border-r border-gray-200 h-full flex flex-col">
			<div className="p-4 border-b border-gray-200">
				<Link href="/" className="text-2xl font-bold text-indigo-600">
                    HuiManager
                </Link>
			</div>

			<nav className="flex-1 p-4 space-y-2">
				{filteredNavigation.map(item => (
					<Link
						key={item.name}
						href={item.href}
						className={cn(
							'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
							pathname.startsWith(item.href)
								? 'bg-indigo-50 text-indigo-700'
								: 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
						)}
					>
                        <item.icon className="h-5 w-5" />
						{item.name}
					</Link>
				))}
			</nav>

			<div className="p-4 border-t border-gray-200 space-y-2">
                {bottomLinks.map(item => (
                     <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                            pathname.startsWith(item.href)
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        )}
                    >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                    </Link>
                ))}
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                    Đăng xuất
                </button>
			</div>
		</aside>
	)
}
