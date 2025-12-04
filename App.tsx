import { Routes, Route, Navigate, BrowserRouter } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import CustomerManagement from "./components/CustomerManagement";
import Bills from "./components/Bills";
import Settings from "./components/Settings";
import { DataProvider } from "./hooks/useData";
import BillForm from "./components/BillForm";

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          {/* <Route path="bills/view/:billId" element={<BillPdf />} /> */}
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
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
