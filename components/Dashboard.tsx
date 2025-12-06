import React, { useEffect, useState } from "react";
import { backendInstance } from "@/utils/constant";
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
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalBills: 0,
    totalRevenue: "₹0",
    unpaidDues: "₹0",
  });
  const [chartData, setChartData] = useState<
    { name: string; revenue: number }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    backendInstance
      .get("/bills/summary")
      .then((response) => {
        const data = response.data;
        setStats({
          totalCustomers: data.totalCustomers,
          totalBills: data.totalBills,
          totalRevenue: `₹${Number(data.totalPaidAmount).toLocaleString(
            "en-IN"
          )}`,
          unpaidDues: `₹${Number(data.totalDues).toLocaleString("en-IN")}`,
        });
        setChartData(
          (data.salesRevenue || []).map((item: any) => ({
            name: new Date(item.date).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
            }),
            revenue: Number(item.dailyTotal),
          }))
        );
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

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
          title="Total Dues"
          value={stats.unpaidDues}
          icon={<AlertIcon className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4 text-brand-dark">
          Last 30 days Revenue
        </h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={chartData}
              // margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
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
