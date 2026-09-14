import Button from './Button'

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title = 'Confirm Action', message, confirmText = 'Confirm', confirmVariant = 'danger', loading }) => {
  if (!isOpen) return null
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-sm" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="text-center" style={{ padding: '8px 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '12px' }}>
              {confirmVariant === 'danger' ? '🗑️' : '⚠️'}
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', lineHeight: 1.6 }}>{message}</p>
          </div>
        </div>
        <div className="modal-footer">
          <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
          <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmText}</Button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
