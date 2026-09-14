import { getStatusBadgeClass } from '../../utils/helpers'

const StatusBadge = ({ status, label }) => (
  <span className={`badge ${getStatusBadgeClass(status)}`}>
    {label || status}
  </span>
)

export default StatusBadge
