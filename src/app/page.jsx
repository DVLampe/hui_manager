'use client'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchHuis } from '@/store/huiSlice'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { HuiCard } from '@/components/hui/HuiCard'
import { cn } from '@/lib/utils'
import { SmallCard } from '@/components/ui/SmallCard'
import { BigCard } from '@/components/ui/BigCard'

export default function Page() {
  return (
    <div className="bg-blue-100 border-4 border-blue-500 rounded-xl p-8 m-8">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">Проверка Tailwind</h1>
      <p className="text-lg text-blue-700">Если вы видите синий фон и рамку — Tailwind работает!</p>
    </div>
  )
}