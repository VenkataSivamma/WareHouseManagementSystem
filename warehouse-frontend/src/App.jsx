import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import Toast from './components/common/Toast'
import ProtectedRoute, { PublicRoute, AdminPublicRoute } from './routes/ProtectedRoute'

import AdminLayout from './layouts/AdminLayout'
import ManagerLayout from './layouts/ManagerLayout'
import StaffLayout from './layouts/StaffLayout'
import SupplierLayout from './layouts/SupplierLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import AdminLoginPage from './pages/auth/AdminLoginPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ResetPasswordPage from './pages/auth/ResetPasswordPage'

// Error Pages
import NotFoundPage from './pages/NotFoundPage'
import UnauthorizedPage from './pages/UnauthorizedPage'

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard'
import Categories from './pages/admin/Categories'
import Products from './pages/admin/Products'
import Suppliers from './pages/admin/Suppliers'
import Managers from './pages/admin/Managers'
import Staff from './pages/admin/Staff'
import PurchaseOrders from './pages/admin/PurchaseOrders'
import AdminInventory from './pages/admin/AdminInventory'
import Reports from './pages/admin/Reports'
import AdminProfile from './pages/admin/AdminProfile'

// Manager Pages
import ManagerDashboard from './pages/manager/ManagerDashboard'
import ManagerInventory from './pages/manager/ManagerInventory'
import PurchaseRequests from './pages/manager/PurchaseRequests'
import StockApprovals from './pages/manager/StockApprovals'
import ManagerReports from './pages/manager/ManagerReports'
import ManagerProfile from './pages/manager/ManagerProfile'

// Staff Pages
import StaffDashboard from './pages/staff/StaffDashboard'
import StockIn from './pages/staff/StockIn'
import StockOut from './pages/staff/StockOut'
import StaffInventory from './pages/staff/StaffInventory'
import ProductSearch from './pages/staff/ProductSearch'
import StaffProfile from './pages/staff/StaffProfile'

// Supplier Pages
import SupplierDashboard from './pages/supplier/SupplierDashboard'
import SupplierOrders from './pages/supplier/SupplierOrders'
import Deliveries from './pages/supplier/Deliveries'
import DeliveryHistory from './pages/supplier/DeliveryHistory'
import SupplierProfile from './pages/supplier/SupplierProfile'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Toast />
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />

            {/* Admin Auth */}
            <Route element={<AdminPublicRoute />}>
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* User Auth */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* Admin Portal */}
            <Route element={<ProtectedRoute allowedRole="ADMIN" layout={AdminLayout} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<Categories />} />
              <Route path="/admin/products" element={<Products />} />
              <Route path="/admin/suppliers" element={<Suppliers />} />
              <Route path="/admin/managers" element={<Managers />} />
              <Route path="/admin/staff" element={<Staff />} />
              <Route path="/admin/purchase-orders" element={<PurchaseOrders />} />
              <Route path="/admin/inventory" element={<AdminInventory />} />
              <Route path="/admin/reports" element={<Reports />} />
              <Route path="/admin/profile" element={<AdminProfile />} />
            </Route>

            {/* Manager Portal */}
            <Route element={<ProtectedRoute allowedRole="MANAGER" layout={ManagerLayout} />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/inventory" element={<ManagerInventory />} />
              <Route path="/manager/purchase-requests" element={<PurchaseRequests />} />
              <Route path="/manager/stock-approvals" element={<StockApprovals />} />
              <Route path="/manager/reports" element={<ManagerReports />} />
              <Route path="/manager/profile" element={<ManagerProfile />} />
            </Route>

            {/* Staff Portal */}
            <Route element={<ProtectedRoute allowedRole="STAFF" layout={StaffLayout} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
              <Route path="/staff/stock-in" element={<StockIn />} />
              <Route path="/staff/stock-out" element={<StockOut />} />
              <Route path="/staff/inventory" element={<StaffInventory />} />
              <Route path="/staff/product-search" element={<ProductSearch />} />
              <Route path="/staff/profile" element={<StaffProfile />} />
            </Route>

            {/* Supplier Portal */}
            <Route element={<ProtectedRoute allowedRole="SUPPLIER" layout={SupplierLayout} />}>
              <Route path="/supplier/dashboard" element={<SupplierDashboard />} />
              <Route path="/supplier/purchase-orders" element={<SupplierOrders />} />
              <Route path="/supplier/deliveries" element={<Deliveries />} />
              <Route path="/supplier/delivery-history" element={<DeliveryHistory />} />
              <Route path="/supplier/profile" element={<SupplierProfile />} />
            </Route>

            {/* Error Pages */}
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
