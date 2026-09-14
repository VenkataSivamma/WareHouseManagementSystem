const Select = ({ label, name, value, onChange, onBlur, error, required, disabled, options = [], placeholder = 'Select...', className = '' }) => (
  <div className="form-group">
    {label && <label className="form-label" htmlFor={name}>{label}{required && <span className="required">*</span>}</label>}
    <select
      id={name} name={name} value={value}
      onChange={onChange} onBlur={onBlur}
      disabled={disabled} required={required}
      className={`form-control${error ? ' error' : ''} ${className}`.trim()}
    >
      <option value="">{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
    {error && <p className="form-error">{error}</p>}
  </div>
)

export default Select
