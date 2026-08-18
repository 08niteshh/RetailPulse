import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { FilterProvider } from './context/FilterContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/layout/Layout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { SalesAnalyticsPage } from './pages/SalesAnalyticsPage';
import { ProductAnalyticsPage } from './pages/ProductAnalyticsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { StoreAnalyticsPage } from './pages/StoreAnalyticsPage';
import { RegionalAnalyticsPage } from './pages/RegionalAnalyticsPage';
import { CustomerAnalyticsPage } from './pages/CustomerAnalyticsPage';
import { InventoryPage } from './pages/InventoryPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { DemandForecastPage } from './pages/DemandForecastPage';
import { AnomalyDetectionPage } from './pages/AnomalyDetectionPage';
import { BusinessInsightsPage } from './pages/BusinessInsightsPage';
import { DataUploadPage } from './pages/DataUploadPage';
import { SQLAnalyticsPage } from './pages/SQLAnalyticsPage';
import { ExportPage } from './pages/ExportPage';
import { AdminPage } from './pages/AdminPage';
import { LoadingSpinner } from './components/common/LoadingSpinner';

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({
  children,
  adminOnly = false,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullPage message="Authenticating session..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user?.role !== 'ADMIN') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FilterProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Auth Routes */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected Dashboard Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="sales" element={<SalesAnalyticsPage />} />
                <Route path="products" element={<ProductAnalyticsPage />} />
                <Route path="products/:id" element={<ProductDetailPage />} />
                <Route path="stores" element={<StoreAnalyticsPage />} />
                <Route path="regions" element={<RegionalAnalyticsPage />} />
                <Route path="customers" element={<CustomerAnalyticsPage />} />
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="recommendations" element={<RecommendationsPage />} />
                <Route path="forecast" element={<DemandForecastPage />} />
                <Route path="anomalies" element={<AnomalyDetectionPage />} />
                <Route path="insights" element={<BusinessInsightsPage />} />
                <Route path="datasets" element={<DataUploadPage />} />
                <Route path="sql-analytics" element={<SQLAnalyticsPage />} />
                <Route path="export" element={<ExportPage />} />

                {/* Admin-only Routes */}
                <Route
                  path="admin"
                  element={
                    <ProtectedRoute adminOnly>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </FilterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
