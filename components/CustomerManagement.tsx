import React, { useState, useMemo, useEffect } from "react";
// import { useData } from "../hooks/useData";
import { Customer } from "../types";
import { calculateBillTotals } from "../utils/calculations";
import CustomerFormModal from "./CustomerFormModal";
import { PlusIcon, SearchIcon, EditIcon, TrashIcon } from "./icons/Icons";
import { backendInstance } from "@/utils/constant";

const CustomerManagement: React.FC = () => {
  // const { customers, bills, deleteCustomer, isLoading } = useData();
  const [customerData, setCustomerData] = useState<Customer[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | undefined>(
    undefined
  );
  const [searchTerm, setSearchTerm] = useState("");

  // const customerData = useMemo(() => {
  //   // return customers
  //   //   .map((customer) => {
  //   //     const customerBills = bills.filter(
  //   //       (bill) => bill.customerId === customer.id
  //   //     );
  //   //     const totalDues = customerBills.reduce(
  //   //       (acc, bill) => acc + calculateBillTotals(bill).balanceDue,
  //   //       0
  //   //     );
  //   //     return {
  //   //       ...customer,
  //   //       billCount: customerBills.length,
  //   //       totalDues,
  //   //     };
  //   //   })
  //   //   .filter(
  //   //     (c) =>
  //   //       c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //   //       c.phone?.includes(searchTerm) ||
  //   //       c.address?.toLowerCase().includes(searchTerm.toLowerCase())
  //   //   );
  // }, [searchTerm]);

  useEffect(() => {
    backendInstance.get("/customers").then((response) => {
      setCustomerData(response.data.data);
    });
  }, []);

  const handleAddCustomer = () => {
    setEditingCustomer(undefined);
    setIsModalOpen(true);
  };

  const handleEditCustomer = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  // if (isLoading) {
  //   return <div className="text-center p-8">Loading customers...</div>;
  // }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-3xl font-bold text-brand-dark">
          Customer Management
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-gold"
            />
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            onClick={handleAddCustomer}
            className="flex items-center justify-center bg-brand-gold text-brand-dark font-semibold px-4 py-2 rounded-md hover:opacity-90 transition-opacity"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 hidden md:table">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Bills
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Total Dues
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {customerData.map((customer) => (
              <tr key={customer._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {customer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {customer.address || "No address"}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {customer.phone.join(", ") || "Not Avaialble"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* {customer.billCount} */} Bill Count
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                  {/* ₹{customer.totalDues.toLocaleString("en-IN")} */} total
                  Dues
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-brand-gold hover:text-yellow-700 p-1"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    // onClick={() => deleteCustomer(customer._id)}
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
          {customerData.map((customer) => (
            <div
              key={customer._id}
              className="bg-gray-50 p-4 rounded-lg shadow space-y-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-lg text-brand-dark">
                    {customer.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {customer.phone || "No phone"}
                  </p>
                  <p className="text-sm text-gray-500">
                    {customer.address || "No address"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditCustomer(customer)}
                    className="text-brand-gold hover:text-yellow-700 p-1"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    // onClick={() => deleteCustomer(customer.id)}
                    className="text-red-600 hover:text-red-900 p-1"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t pt-2">
                <span className="text-gray-600">
                  Bills:{" "}
                  <span className="font-medium text-brand-dark">
                    {/* {customer.billCount} */} Bill count
                  </span>
                </span>
                <span className="text-gray-600">
                  Dues:{" "}
                  <span className="font-medium text-red-600">
                    {/* ₹{customer.totalDues.toLocaleString("en-IN")} */} Total
                    Dues
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {customerData.length === 0 && (
        <p className="text-center text-gray-500 py-8">No customers found.</p>
      )}

      <CustomerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        customer={editingCustomer}
      />
    </div>
  );
};

export default CustomerManagement;
