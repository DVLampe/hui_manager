// src/components/ui/Input.jsx
export default function Input({
  type = 'text',
  label,
  error,
  className = '',
  ...props
}) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`block w-full rounded-md border border-gray-400 shadow-sm transition-colors focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 sm:text-sm ${className}`}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  )
}