'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

export function Toaster() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return createPortal(
    <div
      id="toaster"
      className="fixed bottom-0 right-0 z-50 m-8 flex flex-col gap-2"
    />,
    document.body
  )
}

// Tạo hook để sử dụng toast
export function useToast() {
  const showToast = ({ message, type = 'info' }) => {
    const toaster = document.getElementById('toaster')
    if (!toaster) return

    const toast = document.createElement('div')
    toast.className = `rounded-lg px-4 py-2 text-sm font-medium text-white shadow-lg
      ${type === 'success' ? 'bg-green-500' : ''}
      ${type === 'error' ? 'bg-red-500' : ''}
      ${type === 'info' ? 'bg-blue-500' : ''}
      ${type === 'warning' ? 'bg-yellow-500' : ''}
    `

    toast.textContent = message
    toaster.appendChild(toast)

    // Tự động xóa toast sau 3 giây
    setTimeout(() => {
      toast.remove()
    }, 3000)
  }

  return { showToast }
}
