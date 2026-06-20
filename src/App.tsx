import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';
import { LoyaltyProvider } from './contexts/LoyaltyContext';
import { AdminProvider } from './contexts/AdminContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminProtectedRoute } from './components/admin/AdminProtectedRoute';
import { CustomerLayout } from './components/CustomerLayout';
import { ScrollToTop } from './components/ScrollToTop';
import { Home } from './pages/Home';
import { Cart } from './pages/Cart';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { Profile } from './pages/Profile';
import { UnitSelection } from './pages/UnitSelection';
import { Menu } from './pages/Menu';
import { ProductDetail } from './pages/ProductDetail';
import { Orders } from './pages/Orders';
import { OrderDetail } from './pages/OrderDetail';
import { Fidelidade } from './pages/Fidelidade';
import { Checkout } from './pages/Checkout';
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminReports } from './pages/admin/AdminReports';

function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <AdminProvider>
      <AuthProvider>
        <LoyaltyProvider>
        <CartProvider>
        <ToastProvider>
          <Routes>
            <Route element={<CustomerLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/checkout"
                element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
              <Route path="/cadastro" element={<Register />} />
              <Route path="/recuperar-senha" element={<ForgotPassword />} />
              <Route path="/cardapio" element={<UnitSelection />} />
              <Route path="/cardapio/:unitId" element={<Menu />} />
              <Route path="/produto/:productId" element={<ProductDetail />} />
              <Route
                path="/perfil"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pedidos"
                element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/pedidos/:orderId"
                element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fidelidade"
                element={
                  <ProtectedRoute>
                    <Fidelidade />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin/dashboard"
              element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>}
            />
            <Route
              path="/admin/produtos"
              element={<AdminProtectedRoute><AdminProducts /></AdminProtectedRoute>}
            />
            <Route
              path="/admin/pedidos"
              element={<AdminProtectedRoute><AdminOrders /></AdminProtectedRoute>}
            />
            <Route
              path="/admin/relatorios"
              element={<AdminProtectedRoute><AdminReports /></AdminProtectedRoute>}
            />
          </Routes>
        </ToastProvider>
        </CartProvider>
        </LoyaltyProvider>
      </AuthProvider>
      </AdminProvider>
    </BrowserRouter>
  );
}

export default App;
