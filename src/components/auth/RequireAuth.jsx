
//Tạo component kiểm tra quyền 

'use client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function RequireAuth({ children, roles = [] }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    } else if (status === 'authenticated' && roles.length > 0) {
      if (!roles.includes(session.user.role)) {
        router.push('/auth/unauthorized')
      }
    }
  }, [status, session, roles, router])

  if (status === 'loading') {
    return <div>Đang tải...</div>
  }

  return children
}