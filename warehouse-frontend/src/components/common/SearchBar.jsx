const SearchBar = ({ value, onChange, onClear, placeholder = 'Search...', width }) => (
  <div className="search-box" style={width ? { width } : {}}>
    <span className="search-icon">🔍</span>
    <input
      type="text" className="form-control" value={value}
      onChange={onChange} placeholder={placeholder}
    />
    {value && (
      <span className="input-icon-right" onClick={onClear} style={{ right: 10, top: '50%', transform: 'translateY(-50%)', position: 'absolute', cursor: 'pointer', color: 'var(--text-light)' }}>✕</span>
    )}
  </div>
)

export default SearchBar
