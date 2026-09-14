import Avatar from './Avatar'
import StatusBadge from './StatusBadge'
import { formatDate } from '../../utils/helpers'

const ProfileCard = ({ user }) => (
  <div className="card" style={{ textAlign: 'center', padding: '32px 24px' }}>
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
      <Avatar name={user?.fullName || user?.companyName} size="xl" />
    </div>
    <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>{user?.fullName || user?.companyName}</h3>
    <p className="text-muted text-sm" style={{ marginBottom: 12 }}>{user?.email}</p>
    <StatusBadge status={user?.status || 'active'} label={user?.status || 'Active'} />
    <div className="divider" />
    <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10 }}>
      {user?.role && <div className="detail-item"><div className="detail-label">Role</div><div className="detail-value">{user.role}</div></div>}
      {user?.phone && <div className="detail-item"><div className="detail-label">Phone</div><div className="detail-value">{user.phone}</div></div>}
      {user?.department && <div className="detail-item"><div className="detail-label">Department</div><div className="detail-value">{user.department}</div></div>}
      {user?.warehouseLocation && <div className="detail-item"><div className="detail-label">Location</div><div className="detail-value">{user.warehouseLocation}</div></div>}
      {user?.createdAt && <div className="detail-item"><div className="detail-label">Joined</div><div className="detail-value">{formatDate(user.createdAt)}</div></div>}
    </div>
  </div>
)

export default ProfileCard
