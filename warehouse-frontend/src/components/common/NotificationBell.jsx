import { useState } from 'react'
import useClickOutside from '../../hooks/useClickOutside'
import { formatDateTime } from '../../utils/helpers'

const mockNotifications = [
  { id: 1, text: 'New purchase order #PO-1042 created', time: new Date(), unread: true, icon: '📦' },
  { id: 2, text: 'Low stock alert: Product SKU-2031', time: new Date(Date.now() - 3600000), unread: true, icon: '⚠️' },
  { id: 3, text: 'Supplier ABC confirmed delivery', time: new Date(Date.now() - 7200000), unread: false, icon: '✅' },
  { id: 4, text: 'Stock In approved by manager', time: new Date(Date.now() - 86400000), unread: false, icon: '📥' },
]

const NotificationBell = () => {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(mockNotifications)
  const unreadCount = notifications.filter(n => n.unread).length
  const ref = useClickOutside(() => setOpen(false))

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, unread: false })))

  return (
    <div style={{ position: 'relative' }} ref={ref}>
      <button className="notif-btn" onClick={() => setOpen(p => !p)}>
        🔔
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-header">
            <span className="notif-panel-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={markAllRead}>Mark all read</button>
            )}
          </div>
          <div className="notif-list">
            {notifications.map(n => (
              <div key={n.id} className={`notif-item${n.unread ? ' unread' : ''}`}>
                <span className="notif-item-icon">{n.icon}</span>
                <div>
                  <p className="notif-item-text">{n.text}</p>
                  <p className="notif-item-time">{formatDateTime(n.time)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="notif-panel-footer">
            <a href="#">View all notifications</a>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationBell
