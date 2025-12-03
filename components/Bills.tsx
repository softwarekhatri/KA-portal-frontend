import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  PrintIcon,
} from "./icons/Icons";
import { backendInstance } from "@/utils/constant";
import { Bill } from "@/types";

const Bills: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    backendInstance
      .post("/bills/getBills", {})
      .then((response) => {
        setBills(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching bills:", error);
      });
  }, []);

  const handlePrint = (billId: string) => {
    const printUrl = `#/print/bill/${billId}`;
    window.open(printUrl, "_blank");
  };

  //   if (isLoading) {
  // return <div className="text-center p-8">Loading bills...</div>;
  //   }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-brand-dark">Bills</h2>
        <button
          onClick={() => navigate("/bills/new")}
          className="flex items-center justify-center bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create Bill
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-1">
            <label
              htmlFor="billSearch"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search by Bill ID, Customer...
            </label>
            <div className="relative">
              <input
                id="billSearch"
                type="text"
                placeholder="Search by Bill ID, Customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        {/* Desktop View */}
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Bill ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Customer
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Due
              </th>
              <th className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {bills.map((bill) => (
              <tr key={bill._id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                  {bill._id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {bill.customer?.name || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(bill.billDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ₹{bill.totalAmount.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  ₹{bill.balanceDues.toLocaleString("en-IN")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handlePrint(bill._id)}
                    className="text-gray-500 hover:text-gray-800 p-1"
                  >
                    <PrintIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/bills/edit/${bill._id}`, { state: bill })
                    }
                    className="text-brand-gold hover:text-yellow-700 p-1"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    // onClick={() => deleteBill(bill._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Mobile View */}
        <div className="md:hidden space-y-4 p-4">
          {bills.map((bill) => (
            <div
              key={bill._id}
              className="bg-gray-50 p-4 rounded-lg shadow space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-brand-dark">
                    {bill.customer?.name}
                  </p>
                  <p className="text-sm font-mono text-gray-600">{bill._id}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(bill.billDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePrint(bill._id)}
                    className="text-gray-500 hover:text-gray-800 p-1"
                  >
                    <PrintIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => navigate(`/bills/edit/${bill._id}`)}
                    className="text-brand-gold hover:text-yellow-700 p-1"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    // onClick={() => deleteBill(bill._id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">
                  Total:{" "}
                  <span className="font-medium text-brand-dark">
                    ₹{bill.totalAmount.toLocaleString("en-IN")}
                  </span>
                </span>
                <span className="text-gray-600">
                  Due:{" "}
                  <span className="font-medium text-red-600">
                    ₹{bill.balanceDues.toLocaleString("en-IN")}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {bills.length === 0 && (
        <p className="text-center text-gray-500 py-8">No bills found.</p>
      )}
    </div>
  );
};

export default Bills;
