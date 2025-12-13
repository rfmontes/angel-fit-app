import { HashRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
// Components (to be created)
import Dashboard from './components/Dashboard';
import Inventory from './components/Inventory';
import Sales from './components/Sales';

// Fallback components for now
const TempDashboard = () => <div className="p-4"><h1>Dashboard (Coming Soon)</h1></div>;
const TempInventory = () => <div className="p-4"><h1>Estoque (Coming Soon)</h1></div>;
const TempSales = () => <div className="p-4"><h1>Vendas (Coming Soon)</h1></div>;

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="sales" element={<Sales />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

export default App;
