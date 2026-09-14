import Button from './Button'

const EmptyState = ({ icon = '📭', title = 'No Data Found', description = 'There are no records to display.', action, actionLabel }) => (
  <div className="empty-state">
    <div className="empty-state-icon">{icon}</div>
    <h3 className="empty-state-title">{title}</h3>
    <p className="empty-state-desc">{description}</p>
    {action && <Button onClick={action}>{actionLabel || 'Add New'}</Button>}
  </div>
)

const ErrorState = ({ title = 'Something went wrong', description, onRetry }) => (
  <div className="error-state">
    <div className="error-state-icon">⚠️</div>
    <h3 className="error-state-title">{title}</h3>
    <p className="error-state-desc">{description || 'An error occurred while loading data.'}</p>
    {onRetry && <Button onClick={onRetry}>Try Again</Button>}
  </div>
)

export { EmptyState, ErrorState }
