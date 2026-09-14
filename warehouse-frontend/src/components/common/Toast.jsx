import { useToast } from '../../contexts/ToastContext'

const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' }

const Toast = () => {
  const { toasts, removeToast } = useToast()
  if (!toasts.length) return null
  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{icons[t.type]}</span>
          <div className="toast-content">
            <p className="toast-title">{t.title}</p>
            {t.message && <p className="toast-message">{t.message}</p>}
          </div>
          <button className="toast-close" onClick={() => removeToast(t.id)}>✕</button>
        </div>
      ))}
    </div>
  )
}

export default Toast
