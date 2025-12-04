import React from "react";
import { useData } from "../hooks/useData";
import { CustomerIcon, BillIcon, RupeeIcon, AlertIcon } from "./icons/Icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { calculateBillTotals } from "../utils/calculations";

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}> = ({ title, value, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-brand-dark">{value}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { customers, bills, isLoading } = useData();

  const stats = React.useMemo(() => {
    let totalRevenue = 0;
    let unpaidDues = 0;

    bills.forEach((bill) => {
      const { totalPaid, balanceDue } = calculateBillTotals(bill);
      totalRevenue += totalPaid;
      unpaidDues += balanceDue;
    });

    return {
      totalCustomers: customers.length,
      totalBills: bills.length,
      totalRevenue: `₹${totalRevenue.toLocaleString("en-IN")}`,
      unpaidDues: `₹${unpaidDues.toLocaleString("en-IN")}`,
    };
  }, [customers, bills]);

  const chartData = React.useMemo(() => {
    const monthlyData: { [key: string]: number } = {};
    bills.forEach((bill) => {
      const month = new Date(bill.billDate).toLocaleString("default", {
        month: "short",
        year: "2-digit",
      });
      const { totalAmount } = calculateBillTotals(bill);
      if (!monthlyData[month]) {
        monthlyData[month] = 0;
      }
      monthlyData[month] += totalAmount;
    });
    return Object.entries(monthlyData)
      .map(([name, revenue]) => ({ name, revenue }))
      .slice(-6);
  }, [bills]);

  if (isLoading) {
    return <div className="text-center p-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-brand-dark">Dashboard</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Customers"
          value={stats.totalCustomers}
          icon={<CustomerIcon className="h-6 w-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Total Bills"
          value={stats.totalBills}
          icon={<BillIcon className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Total Revenue"
          value={stats.totalRevenue}
          icon={<RupeeIcon className="h-6 w-6 text-white" />}
          color="bg-brand-gold"
        />
        <StatCard
          title="Unpaid Dues"
          value={stats.unpaidDues}
          icon={<AlertIcon className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-brand-dark">
          Monthly Revenue (Last 6 Months)
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) =>
                  `₹${value.toLocaleString("en-IN")}`
                }
              />
              <Legend />
              <Bar dataKey="revenue" fill="#C0A062" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
