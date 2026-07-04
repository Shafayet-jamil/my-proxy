export function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 rounded-lg font-medium text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark',
    secondary: 'hover:bg-gray-200 dark:hover:bg-gray-600',
    danger: 'bg-danger text-white hover:bg-red-600',
    ghost: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    outline: 'border hover:bg-gray-50 dark:hover:bg-gray-700'
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-base'
  }
  const size = props.size || 'md'

  const variantStyles = {
    secondary: { color: 'var(--text-primary)', backgroundColor: 'var(--bg-hover)', borderColor: 'var(--border-color)' },
    ghost: { color: 'var(--text-secondary)' },
    outline: { color: 'var(--text-primary)', borderColor: 'var(--border-color-strong)' }
  }

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      style={variantStyles[variant]}
      {...props}
    >
      {children}
    </button>
  )
}

export function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full h-10 px-3 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:disabled:bg-gray-700 dark:placeholder-gray-400 ${className}`}
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
      {...props}
    />
  )
}

export function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3 py-2 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 ${className}`}
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
      {...props}
    />
  )
}

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={`rounded-xl border shadow-sm ${className}`}
      style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', boxShadow: 'var(--shadow-card)', color: 'var(--text-primary)' }}
      {...props}
    >
      {children}
    </div>
  )
}

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  )
}

export function Avatar({ src, name, size = 'md', className = '' }) {
  const sizes = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-14 h-14 text-lg' }
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
  return (
    <div className={`rounded-full overflow-hidden flex-shrink-0 ${sizes[size]} ${className}`}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-8 h-full bg-primary/20 text-primary flex items-center justify-center font-semibold">
          {initials}
        </div>
      )}
    </div>
  )
}

export function Stars({ rating = 0, size = 'sm' }) {
  const sizeClass = size === 'sm' ? 'text-sm' : 'text-lg'
  return (
    <span className={sizeClass}>
      {'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}
    </span>
  )
}

export function Select({ className = '', children, ...props }) {
  return (
    <select
      className={`w-full h-10 px-3 rounded-lg border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100 ${className}`}
      style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--bg-input)', color: 'var(--text-primary)' }}
      {...props}
    >
      {children}
    </select>
  )
}
