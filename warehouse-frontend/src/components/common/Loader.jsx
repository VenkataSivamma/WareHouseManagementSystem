const Loader = ({ fullPage, text = 'Loading...' }) => {
  if (fullPage) return (
    <div className="loader-overlay">
      <div className="page-loader">
        <div className="spinner spinner-lg" />
        <p>{text}</p>
      </div>
    </div>
  )
  return (
    <div className="page-loader">
      <div className="spinner" />
      <p>{text}</p>
    </div>
  )
}

export default Loader
