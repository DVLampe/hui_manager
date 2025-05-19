// src/components/ui/Button.jsx
import { cn } from '@/lib/utils'
import Link from 'next/link'

export default function Button({ 
  children, 
  variant = 'primary', 
  size = 'sm',
  href,
  className,
  ...props 
}) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50'
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus-visible:ring-primary-500',
    secondary: 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 focus-visible:ring-gray-500',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500',
    ghost: 'hover:bg-gray-50 text-gray-600 hover:text-gray-900',
  }

  const sizes = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2.5 text-sm',
  }

  const classes = cn(
    baseStyles,
    variants[variant],
    sizes[size],
    className
  )

  if (href) {
    return (
      <Link href={href} className={classes} {...props}>
        {children}
      </Link>
    )
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  )
}