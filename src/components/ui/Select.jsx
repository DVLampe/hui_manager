// src/components/ui/Select.jsx
export default function Select({
    label,
    error,
    className = '',
    children,
    options,
    variant = 'default', // Add variant prop
    ...props
  }) {
    const baseClasses = "appearance-none block w-full sm:text-sm sm:leading-6";
    const variantClasses = {
      default: "rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600",
      minimal: "bg-transparent border-0 text-gray-500 hover:text-gray-700 focus:ring-0 focus:outline-none pr-8"
    };

    return (
      <div>
        {label && (
          <label htmlFor={props.id || undefined} className="block text-sm font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={props.id || undefined}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            {...props}
          >
            {options && options.map(option => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
            {!options && children} {/* Fallback to children if options prop is not provided */}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    )
  }
