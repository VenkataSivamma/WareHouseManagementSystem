import { getInitials } from '../../utils/helpers'

const Avatar = ({ name, src, size = '' }) => (
  <div className={`avatar${size ? ` avatar-${size}` : ''}`}>
    {src ? <img src={src} alt={name} /> : getInitials(name)}
  </div>
)

export default Avatar
