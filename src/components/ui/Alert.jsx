// src/components/ui/Alert.jsx
export default function Alert({
    type = 'info',
    title,
    children,
    onClose,
    className = ''
  }) {
    const types = {
      info: 'bg-blue-50 text-blue-800',
      success: 'bg-green-50 text-green-800',
      warning: 'bg-yellow-50 text-yellow-800',
      error: 'bg-red-50 text-red-800',
    }
  
    const icons = {
      info: 'InformationCircleIcon',
      success: 'CheckCircleIcon',
      warning: 'ExclamationIcon',
      error: 'XCircleIcon',
    }
  
    return (
      <div className={`rounded-md p-4 ${types[type]} ${className}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {/* Add icon component here */}
          </div>
          <div className="ml-3">
            {title && (
              <h3 className="text-sm font-medium">{title}</h3>
            )}
            <div className="text-sm">{children}</div>
          </div>
          {onClose && (
            <div className="ml-auto pl-3">
              <button
                type="button"
                className="inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={onClose}
              >
                <span className="sr-only">Đóng</span>
                {/* Add X icon component here */}
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }