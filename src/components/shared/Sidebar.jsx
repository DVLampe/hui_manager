'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSelector } from 'react-redux'
import { cn } from '@/lib/utils'

const navigationItems = [
	{ name: 'Dashboard', href: '/admin', adminOnly: true }, 
	{ name: 'Hui Groups', href: '/hui', adminOnly: false },
	{ name: 'Members', href: '/members', adminOnly: false },
	{ name: 'Payments', href: '/payments', adminOnly: false },
	{ name: 'Statistics', href: '/admin/statistics', adminOnly: true },
	{ name: 'Users', href: '/admin/users', adminOnly: true },
	{ name: 'Roles', href: '/admin/roles', adminOnly: true },
	{ name: 'Permissions', href: '/admin/permissions', adminOnly: true },
]

export default function Sidebar() {
	const pathname = usePathname()
	const { user } = useSelector((state) => state.auth) 

	const isAdmin = user && user.role === 'ADMIN'; 

	const filteredNavigation = navigationItems.filter(item => {
		if (item.adminOnly) {
			return isAdmin;
		}
		return true;
	});

	return (
		<aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between py-6 px-0 fixed left-0 top-0 shadow-md overflow-y-auto z-10">
			<div className="px-6 mb-6">
				<h1 className="text-xl font-bold text-indigo-600">HuiManager</h1>
			</div>
			<nav className="flex-1 flex flex-col gap-1">
				{filteredNavigation.map(item => (
					<Link
						key={item.name}
						href={item.href}
						className={cn(
							'block px-8 py-3 text-base font-medium transition-colors',
							pathname === item.href
								? 'bg-indigo-50 text-indigo-700 font-semibold'
								: 'text-gray-600 hover:bg-gray-50'
						)}
					>
						{item.name}
					</Link>
				))}
			</nav>
			{/* Profile and Settings Links */}
			<div className="flex flex-col gap-1 px-8 pb-4 border-t border-gray-200 pt-4 mt-4">
				{user && (
					<Link 
						href="/profile" 
						className={cn(
							'block py-3 text-base font-medium transition-colors',
							pathname === '/profile'
								? 'text-indigo-600 font-semibold' // Slightly different active style for these links
								: 'text-gray-500 hover:text-indigo-600'
						)}
					>
						Profile
					</Link>
				)}
				<Link 
					href="/settings" 
					className={cn(
						'block py-3 text-base font-medium transition-colors',
						pathname === '/settings'
							? 'text-indigo-600 font-semibold'
							: 'text-gray-500 hover:text-indigo-600'
					)}
				>
					Settings
				</Link>
				<Link 
					href="/auth/signin" // Should be changed to an actual logout mechanism
					className="block py-3 text-gray-500 hover:text-indigo-600 text-base rounded-md"
					// onClick={handleLogout} // Example: if you implement a logout function
				>
					Log out
				</Link>
			</div>
		</aside>
	)
}
