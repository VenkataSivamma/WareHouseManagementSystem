const Button = ({ children, variant = 'primary', size = '', icon, loading, full, onClick, type = 'button', disabled, className = '' }) => {
  const cls = `btn btn-${variant}${size ? ` btn-${size}` : ''}${full ? ' btn-full' : ''} ${className}`.trim()
  return (
    <button type={type} className={cls} onClick={onClick} disabled={disabled || loading}>
      {loading ? <span className="spinner spinner-sm" /> : icon && <span>{icon}</span>}
      {children}
    </button>
  )
}

export default Button
