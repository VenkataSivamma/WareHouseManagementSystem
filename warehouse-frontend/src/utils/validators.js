export const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
export const validatePhone = (phone) => /^[6-9]\d{9}$/.test(phone)
export const validateGST = (gst) => /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst)
export const validatePassword = (pwd) => pwd && pwd.length >= 8

export const validateManagerLogin = (values) => {
  const errors = {}
  if (!values.email) errors.email = 'Email is required'
  else if (!validateEmail(values.email)) errors.email = 'Enter a valid email'
  if (!values.password) errors.password = 'Password is required'
  return errors
}

export const validateStaffLogin = (values) => {
  const errors = {}
  if (!values.identifier) errors.identifier = 'Employee ID or Email is required'
  if (!values.password) errors.password = 'Password is required'
  return errors
}

export const validateAdminLogin = (values) => {
  const errors = {}
  if (!values.email) errors.email = 'Email is required'
  else if (!validateEmail(values.email)) errors.email = 'Enter a valid email'
  if (!values.password) errors.password = 'Password is required'
  return errors
}

export const validateManagerRegister = (values) => {
  const errors = {}
  if (!values.fullName) errors.fullName = 'Full name is required'
  if (!values.employeeId) errors.employeeId = 'Employee ID is required'
  if (!values.email) errors.email = 'Email is required'
  else if (!validateEmail(values.email)) errors.email = 'Enter a valid email'
  if (!values.phone) errors.phone = 'Phone is required'
  else if (!validatePhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone'
  if (!values.department) errors.department = 'Department is required'
  if (!values.warehouseLocation) errors.warehouseLocation = 'Warehouse location is required'
  if (!values.password) errors.password = 'Password is required'
  else if (!validatePassword(values.password)) errors.password = 'Password must be at least 8 characters'
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm password'
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}

export const validateSupplierRegister = (values) => {
  const errors = {}
  if (!values.companyName) errors.companyName = 'Company name is required'
  if (!values.contactPerson) errors.contactPerson = 'Contact person is required'
  if (!values.gstNumber) errors.gstNumber = 'GST number is required'
  else if (!validateGST(values.gstNumber)) errors.gstNumber = 'Enter a valid GST number'
  if (!values.email) errors.email = 'Email is required'
  else if (!validateEmail(values.email)) errors.email = 'Enter a valid email'
  if (!values.phone) errors.phone = 'Phone is required'
  else if (!validatePhone(values.phone)) errors.phone = 'Enter a valid 10-digit phone'
  if (!values.companyAddress) errors.companyAddress = 'Company address is required'
  if (!values.password) errors.password = 'Password is required'
  else if (!validatePassword(values.password)) errors.password = 'Password must be at least 8 characters'
  if (!values.confirmPassword) errors.confirmPassword = 'Please confirm password'
  else if (values.password !== values.confirmPassword) errors.confirmPassword = 'Passwords do not match'
  return errors
}
