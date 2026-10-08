import { Routes, Route, Navigate } from 'react-router-dom';
import { RoleProvider } from './context/RoleContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import BatchList from './pages/BatchList.jsx';
import BatchDetail from './pages/BatchDetail.jsx';
import Violations from './pages/Violations.jsx';
import Verify from './pages/Verify.jsx';
import Scan from './pages/Scan.jsx';
import Ledger from './pages/Ledger.jsx';
import About from './pages/About.jsx';
import Users from './pages/Users.jsx';

/**
 * Route guard — requires authentication.
 * Redirects to /login if user is not logged in.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

/**
 * Route guard — requires authentication AND a specific role.
 * Admin role has implicit access to everything.
 * Redirects to /login if not authenticated, /dashboard if wrong role.
 *
 * @param {string[]} requiredRoles — roles allowed to access this route
 */
function RoleProtectedRoute({ requiredRoles, children }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const userRole = user?.role;
  if (userRole !== 'admin' && !requiredRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

/**
 * Redirects authenticated users away from /login back to /dashboard.
 */
function PublicOnlyRoute({ children }) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function AppContent() {
  return (
    <div className="min-h-screen flex flex-col bg-page">
      <Navbar />
      <main className="flex-1 pt-16">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Auth-protected routes (any role) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <ProtectedRoute>
                <BatchList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/batch/:id"
            element={
              <ProtectedRoute>
                <BatchDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/violations"
            element={
              <ProtectedRoute>
                <Violations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <Scan />
              </ProtectedRoute>
            }
          />
          <Route
            path="/about"
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            }
          />

          {/* Role-protected routes */}
          <Route
            path="/ledger"
            element={
              <RoleProtectedRoute requiredRoles={['inspector']}>
                <Ledger />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/verify"
            element={
              <RoleProtectedRoute requiredRoles={['inspector']}>
                <Verify />
              </RoleProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <RoleProtectedRoute requiredRoles={['admin']}>
                <Users />
              </RoleProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </AuthProvider>
  );
}
