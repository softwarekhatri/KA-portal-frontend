import React, { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import { useNavigate } from "react-router-dom";
import ReactDOM from "react-dom/client";
import {
  PlusIcon,
  SearchIcon,
  EditIcon,
  TrashIcon,
  PrintIcon,
} from "./icons/Icons";
import { backendInstance } from "@/utils/constant";
import { Bill } from "@/types";
import Toast, { ToastType } from "./Toast";
import { BillPdf } from "./BillPdf";

const Bills: React.FC = () => {
  const [showRatePer10g, setShowRatePer10g] = useState(false);
  const [showDiscount, setShowDiscount] = useState(false);
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bills, setBills] = useState<Bill[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  // Auto-dismiss toast after 1.5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 1500);
      return () => clearTimeout(timer);
    }
  }, [toast]);
  const [loading, setLoading] = useState(false);

  const handleDeleteBill = (billId: string) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      backendInstance.delete(`/bills/${billId}`).then(() => {
        setBills((prev) => prev.filter((b) => b._id !== billId));
        setToast({ message: "Bill deleted successfully!", type: "success" });
      });
    }
  };

  useEffect(() => {
    setLoading(true);
    // Only call API if both startDate and endDate are selected, or neither is selected
    const bothDatesSelected = startDate && endDate;
    const neitherDateSelected = !startDate && !endDate;
    if (!(bothDatesSelected || neitherDateSelected)) return;

    let filter: any = {
      page,
      limit,
    };
    if (debouncedSearchTerm) {
      if (debouncedSearchTerm.startsWith("KA-")) {
        filter.billId = debouncedSearchTerm;
      } else {
        filter.search = debouncedSearchTerm;
      }
    }
    if (bothDatesSelected) {
      filter.startDate = startDate;
      filter.endDate = endDate;
    }
    backendInstance
      .post("/bills/getBills", filter)
      .then((response) => {
        setBills(response.data.data);
        setTotalPages(response.data.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching bills:", error);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm, startDate, endDate, page, limit]);

  const handlePrint = (bill: Bill) => {
    const printWindow = window.open("", "_blank", "width=1000,height=800");
    const div = printWindow.document.createElement("div");
    printWindow.document.body.appendChild(div);
    const root = ReactDOM.createRoot(div);
    root.render(
      <BillPdf
        bill={bill}
        showRatePer10g={showRatePer10g}
        showDiscount={showDiscount}
      />
    );
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // if (loading) {
  //   return <div className="text-center p-8">Fetching bills...</div>;
  // }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="space-y-6">
        {/* Print column selection */}
        <div className="flex gap-4 items-center bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
          <span className="font-semibold text-brand-dark">
            Show columns in print:
          </span>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showRatePer10g}
              onChange={(e) => setShowRatePer10g(e.target.checked)}
            />
            Rate per 10g
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={showDiscount}
              onChange={(e) => setShowDiscount(e.target.checked)}
            />
            Discount
          </label>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-3xl font-bold text-brand-dark">
            Bills Management
          </h2>
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
            {loading ? (
              <div className="text-center p-8">Fetching bills...</div>
            ) : (
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
                    Bill
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Dues
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
            )}
            <tbody className="bg-white divide-y divide-gray-200">
              {bills.map((bill) => (
                <tr key={bill._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {bill._id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {bill.customer ? (
                      <div className="flex flex-col gap-1 min-w-[120px]">
                        <span className="font-semibold text-brand-dark text-base">
                          {bill.customer.name}
                        </span>
                        {bill.customer.phone &&
                          bill.customer.phone.length > 0 && (
                            <span className="text-xs text-gray-600 break-all">
                              {bill.customer.phone.join(", ")}
                            </span>
                          )}
                        {bill.customer.address && (
                          <span className="text-xs text-gray-500 break-all">
                            {bill.customer.address}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
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
                      onClick={() => handlePrint(bill)}
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
                      onClick={() => handleDeleteBill(bill._id)}
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
            {loading ? (
              <div className="text-center p-8">Fetching bills...</div>
            ) : (
              bills.map((bill) => (
                <div
                  key={bill._id}
                  className="bg-gray-50 p-4 rounded-lg shadow space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-lg text-brand-dark">
                        {bill.customer?.name}
                      </p>
                      <p className="text-sm font-mono text-gray-600">
                        {bill._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(bill.billDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handlePrint(bill)}
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
                        onClick={() => handleDeleteBill(bill._id)}
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
              ))
            )}
          </div>
        </div>
        {!loading && bills.length === 0 && (
          <p className="text-center text-gray-500 py-8">No bills found.</p>
        )}
        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-4">
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="px-2">
              Page {page} of {totalPages}
            </span>
            <button
              className="px-3 py-1 rounded bg-gray-200 text-gray-700 disabled:opacity-50"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Bills;
