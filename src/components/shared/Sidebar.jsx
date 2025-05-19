// src/components/shared/Sidebar.jsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navigation = [
	{ name: 'Dashboard', href: '/admin' },
	{ name: 'Hui Groups', href: '/hui' },
	{ name: 'Members', href: '/members' },
	{ name: 'Payments', href: '/payments' },
	{ name: 'Reports', href: '/reports' },
	{ name: 'Statistics', href: '/admin/statistics' },
	{ name: 'Users', href: '/admin/users' },
	{ name: 'Roles', href: '/admin/roles' },
	{ name: 'Permissions', href: '/admin/permissions' },
]

export default function Sidebar() {
	const pathname = usePathname()
	return (
		<aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col justify-between py-6 px-0 fixed left-0 top-0 shadow-md overflow-y-auto z-10">
			<div className="px-6 mb-6">
				<h1 className="text-xl font-bold text-indigo-600">HuiManager</h1>
			</div>
			<nav className="flex-1 flex flex-col gap-1">
				{navigation.map(item => (
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
			<div className="flex flex-col gap-1 px-8 pb-4 border-t border-gray-200 pt-4 mt-4">
				<Link href="/settings" className="block py-3 text-gray-500 hover:text-primary-600 text-base rounded-md">
					Settings
				</Link>
				<Link href="/auth/signin" className="block py-3 text-gray-500 hover:text-primary-600 text-base rounded-md">
					Log out
				</Link>
			</div>
		</aside>
	)
}