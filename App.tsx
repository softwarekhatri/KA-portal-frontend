
import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CustomerManagement from './components/CustomerManagement';
import Bills from './components/Bills';
import Settings from './components/Settings';
import { DataProvider } from './hooks/useData';
import BillForm from './components/BillForm';
import PrintableBill from './components/PrintableBill';

function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/print/bill/:billId" element={<PrintableBill />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="bills" element={<Bills />} />
            <Route path="bills/new" element={<BillForm />} />
            <Route path="bills/edit/:billId" element={<BillForm />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </HashRouter>
    </DataProvider>
  );
}

export default App;
