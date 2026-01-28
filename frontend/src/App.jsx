import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import BrandPage from './pages/BrandPage';
import ItemPage from './pages/Items/ItemPage';
import AddItemPage from './pages/Items/AddItemPage';
import SellingPage from './pages/SellingPage';
import SalesListPage from './pages/SalesListPage';
import ReportsPage from './pages/ReportsPage';
import { Toaster } from 'react-hot-toast';

import OfflineNotice from './components/OfflineNotice';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return user ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <OfflineNotice />
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <PrivateRoute>
            <MainLayout />
          </PrivateRoute>
        }>
          <Route index element={<Navigate to="/dashboard" />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="brands" element={<BrandPage />} />
          <Route path="items" element={<ItemPage />} />
          <Route path="items/add" element={<AddItemPage />} />
          <Route path="suppliers" element={<div>Suppliers Page (Coming Soon)</div>} />
          <Route path="selling" element={<SellingPage />} />
          <Route path="sales-history" element={<SalesListPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
