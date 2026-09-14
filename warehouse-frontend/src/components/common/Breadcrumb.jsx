import { Link } from 'react-router-dom'

const Breadcrumb = ({ items = [] }) => (
  <nav className="breadcrumb">
    {items.map((item, i) => (
      <span key={i} className="breadcrumb-item">
        {i > 0 && <span className="breadcrumb-sep">›</span>}
        {item.path && i < items.length - 1
          ? <Link to={item.path}>{item.label}</Link>
          : <span className={i === items.length - 1 ? 'active' : ''}>{item.label}</span>
        }
      </span>
    ))}
  </nav>
)

export default Breadcrumb
