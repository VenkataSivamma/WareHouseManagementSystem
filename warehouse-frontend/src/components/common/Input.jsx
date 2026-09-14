const Input = ({ label, name, type = 'text', value, onChange, onBlur, error, placeholder, required, disabled, icon, iconRight, onIconRightClick, hint, className = '' }) => (
  <div className="form-group">
    {label && <label className="form-label" htmlFor={name}>{label}{required && <span className="required">*</span>}</label>}
    <div className={icon || iconRight ? 'input-group' : ''}>
      {icon && <span className="input-icon">{icon}</span>}
      <input
        id={name} name={name} type={type} value={value}
        onChange={onChange} onBlur={onBlur} placeholder={placeholder}
        disabled={disabled} required={required}
        className={`form-control${error ? ' error' : ''} ${className}`.trim()}
      />
      {iconRight && <span className="input-icon-right" onClick={onIconRightClick}>{iconRight}</span>}
    </div>
    {error && <p className="form-error">{error}</p>}
    {hint && !error && <p className="form-hint">{hint}</p>}
  </div>
)

export default Input
