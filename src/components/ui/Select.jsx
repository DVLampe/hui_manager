// src/components/ui/Select.jsx
export default function Select({
    label,
    error,
    className = '',
    children,
    options, // Added options prop
    ...props
  }) {
    return (
      <div>
        {label && (
          <label htmlFor={props.id || undefined} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          id={props.id || undefined}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${className}`}
          {...props}
        >
          {options && options.map(option => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
          {!options && children} {/* Fallback to children if options prop is not provided */}
        </select>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
