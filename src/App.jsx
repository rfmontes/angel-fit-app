import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Components (to be created)
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';
import Login from './components/Login';
import AuthRoute from './components/AuthRoute';
import { useStore } from './lib/store';
import { useEffect } from 'react';

function App() {
  const checkSession = useStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<AuthRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="sales" element={<Sales />} />
          </Route>
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
