import React, { useState, useEffect, useMemo, useCallback } from "react";
import Toast, { ToastType } from "./Toast";
import { useDebounce } from "../hooks/useDebounce";
import CustomerFormModal from "./CustomerFormModal";
import { backendInstance } from "@/utils/constant";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Customer,
  Bill,
  BillItem,
  Payment,
  PaymentMode,
  MakingChargeType,
} from "../types";
import { calculateBillTotals } from "../utils/calculations";
import { PlusIcon, TrashIcon, ChevronLeftIcon, XIcon } from "./icons/Icons";

const BillForm: React.FC = () => {
  const { billId } = useParams();
  const navigate = useNavigate();

  const location = useLocation();
  const billData = location.state as Bill | undefined;

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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchDatalist, setSearchDatalist] = useState<Customer[]>([]);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<BillItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const isEditing = Boolean(billId);

  // Debounced search term
  const debouncedSearchTerm = useDebounce(customerSearch);

  useEffect(() => {
    if (billData) {
      setSelectedCustomer(billData?.customer || null);
      setBillDate(new Date(billData.billDate).toISOString().split("T")[0]);
      setItems(billData.items);
      setPayments(billData.payments);
    }
  }, []);

  // Fetch customers from API with pagination and search
  useEffect(() => {
    if (debouncedSearchTerm.length < 1) {
      setSearchDatalist([]);
      return;
    }
    setCustomerLoading(true);
    backendInstance
      .get(`/customers?limit=50&query=${debouncedSearchTerm}`)
      .then((response) => {
        setSearchDatalist(response.data.data || []);
      })
      .catch(() => {
        setSearchDatalist([]);
      })
      .finally(() => setCustomerLoading(false));
  }, [debouncedSearchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerSearch(e.target.value);
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchDatalist([]);
  };

  // Handle new customer creation and selection
  const handleCreateCustomer = () => {
    setIsCustomerModalOpen(true);
  };

  // After modal closes, select the last customer added
  const handleCustomerModalClose = () => {
    setIsCustomerModalOpen(false);
    setCustomerSearch("");
  };

  // Items management
  const addItem = () => {
    setItems([
      ...items,
      {
        name: "",
        weightInGrams: 0,
        ratePer10g: 0,
        makingCharge: 0,
        discount: 0,
        totalPrice: 0,
        makingChargeType: MakingChargeType.FIXED,
      },
    ]);
  };

  const updateItem = (
    index: number,
    field: keyof BillItem,
    value: string | number
  ) => {
    const newItems = [...items];
    if (field === "name") {
      newItems[index] = { ...newItems[index], [field]: value as string };
    } else {
      const numValue = typeof value === "string" ? parseFloat(value) : value;
      newItems[index] = {
        ...newItems[index],
        [field]: isNaN(numValue) ? 0 : numValue,
      };
    }
    setItems(newItems);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  // Payments management
  const addPayment = () => {
    setPayments([
      ...payments,
      {
        amountPaid: 0,
        paymentMode: PaymentMode.CASH,
        paymentDate: new Date(),
        referenceId: "",
      },
    ]);
  };

  const updatePayment = (index: number, field: keyof Payment, value: any) => {
    const newPayments = [...payments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    setPayments(newPayments);
  };

  const removePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const { totalAmount, totalPaid, balanceDue } = useMemo(() => {
    return calculateBillTotals({ items, payments } as Bill);
  }, [items, payments]);

  const handleAddBill = async (billData: Bill) => {
    try {
      const response = await backendInstance.post("/bills", billData);
      setToast({ message: "Bill added successfully!", type: "success" });
      console.log("Bill added successfully ", response.data);
      setTimeout(() => navigate("/bills"), 1200);
    } catch (error) {
      console.error("Error adding bill: ", error);
      setToast({
        message: "Error adding bill. Please try again.",
        type: "error",
      });
    }
  };

  const handleUpdateBill = async (billId: string, billData: Bill) => {
    try {
      const response = await backendInstance.patch(
        `/bills/${billId}`,
        billData
      );
      setToast({ message: "Bill updated successfully!", type: "success" });
      console.log("Bill updated successfully ", response.data);
      setTimeout(() => navigate("/bills"), 1200);
    } catch (error) {
      console.error("Error updating bill: ", error);
      setToast({
        message: "Error updating bill. Please try again.",
        type: "error",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      setToast({ message: "Please select a customer.", type: "error" });
      return;
    }

    const billData: Bill = {
      customerId: selectedCustomer._id,
      billDate: new Date(billDate),
      items: items.filter(
        (item) => item.name && item.weightInGrams > 0 && item.ratePer10g > 0
      ),
      payments: payments.filter((p) => p.amountPaid > 0),
      totalAmount: totalAmount,
      balanceDues: balanceDue,
    };
    if (isEditing && billId) {
      await handleUpdateBill(billId, billData);
    } else {
      await handleAddBill(billData);
    }
  };

  const getItemPrice = useCallback((item: BillItem) => {
    return (
      (item.weightInGrams * item.ratePer10g) / 10 +
      item.makingCharge -
      item.discount
    );
  }, []);

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-200"
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          <h2 className="text-3xl font-bold text-brand-dark">
            {isEditing ? "Edit Bill" : "Create New Bill"}
          </h2>
        </div>

        {/* Customer Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">
                Search & Select Customer
              </label>
              <input
                type="text"
                value={customerSearch}
                onChange={handleSearchChange}
                placeholder="Search by name, phone, or address"
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                disabled={!!selectedCustomer}
              />
              {/* Only show dropdown and loading if no customer is selected */}
              {!selectedCustomer && customerLoading && (
                <div className="absolute left-0 right-0 bg-white border border-gray-300 rounded-md mt-1 p-2 text-center text-gray-500">
                  Loading...
                </div>
              )}
              {!selectedCustomer && searchDatalist.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                  {searchDatalist.map((c) => (
                    <li
                      key={c._id}
                      onClick={() => selectCustomer(c)}
                      className="p-2 hover:bg-brand-gold hover:text-white cursor-pointer group"
                    >
                      <div className="font-semibold">
                        {c.name} - {c.phone.join(", ") || "N/A"}
                      </div>
                      <div className="text-xs text-gray-600 group-hover:text-white">
                        {c.address || "No address"}
                      </div>
                    </li>
                  ))}
                  {/* Always show option to create new customer at end */}
                  <li
                    className="p-2 text-center text-brand-gold cursor-pointer border-t"
                    onClick={handleCreateCustomer}
                  >
                    Have not found the customer?{" "}
                    <span className="underline">Create new customer</span>
                  </li>
                </ul>
              )}
              {/* If no results and not loading, show create option */}
              {!selectedCustomer &&
                searchDatalist.length === 0 &&
                !customerLoading &&
                debouncedSearchTerm.length > 0 && (
                  <div
                    className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 p-2 text-center text-brand-gold cursor-pointer"
                    onClick={handleCreateCustomer}
                  >
                    Have not found the customer?{" "}
                    <span className="underline">Create new customer</span>
                  </div>
                )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bill Date
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="mt-1 w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          {selectedCustomer && (
            <div className="mt-4 p-4 bg-brand-light rounded-md border border-brand-gold/50 relative">
              <button
                type="button"
                className="absolute top-2 right-2 text-xs p-1 bg-red-100 text-red-700 rounded-full hover:bg-red-200"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Remove selected customer"
              >
                <XIcon className="w-4 h-4" />
              </button>
              <p>
                <strong>Name:</strong> {selectedCustomer.name}
              </p>
              <p>
                <strong>Phone:</strong>{" "}
                {selectedCustomer.phone.join(", ") || "N/A"}
              </p>
              <p>
                <strong>Address:</strong> {selectedCustomer.address || "N/A"}
              </p>
            </div>
          )}
        </div>

        {/* Items Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Items</h3>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border rounded-md relative"
              >
                <input
                  type="text"
                  placeholder="Item Name"
                  value={item.name}
                  onChange={(e) => updateItem(index, "name", e.target.value)}
                  className="md:col-span-3 p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Weight (g)"
                  value={item.weightInGrams || ""}
                  onChange={(e) =>
                    updateItem(index, "weightInGrams", e.target.value)
                  }
                  className="md:col-span-1 p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Rate/10g"
                  value={item.ratePer10g || ""}
                  onChange={(e) =>
                    updateItem(index, "ratePer10g", e.target.value)
                  }
                  className="md:col-span-2 p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Making"
                  value={item.makingCharge || ""}
                  onChange={(e) =>
                    updateItem(index, "makingCharge", e.target.value)
                  }
                  className="md:col-span-2 p-2 border rounded"
                />
                <input
                  type="number"
                  placeholder="Discount"
                  value={item.discount || ""}
                  onChange={(e) =>
                    updateItem(index, "discount", e.target.value)
                  }
                  className="md:col-span-1 p-2 border rounded"
                />
                <div className="md:col-span-2 flex items-center justify-end font-semibold p-2">
                  ₹{getItemPrice(item).toLocaleString("en-IN")}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 flex items-center text-brand-gold font-semibold"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Add Item
          </button>
        </div>

        {/* Payments Section */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Payments</h3>
          <div className="space-y-4">
            {payments.map((payment, index) => (
              <div
                key={index}
                className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border rounded-md relative"
              >
                <input
                  type="number"
                  placeholder="Amount Paid"
                  value={payment.amountPaid || ""}
                  onChange={(e) =>
                    updatePayment(
                      index,
                      "amountPaid",
                      parseFloat(e.target.value)
                    )
                  }
                  className="md:col-span-3 p-2 border rounded"
                />
                <input
                  type="date"
                  value={
                    payment.paymentDate
                      ? new Date(payment.paymentDate)
                          .toISOString()
                          .split("T")[0]
                      : ""
                  }
                  onChange={(e) =>
                    updatePayment(index, "paymentDate", e.target.value)
                  }
                  className="md:col-span-3 p-2 border rounded"
                />
                <select
                  value={payment.paymentMode}
                  onChange={(e) =>
                    updatePayment(index, "paymentMode", e.target.value)
                  }
                  className="md:col-span-2 p-2 border rounded bg-white"
                >
                  <option value={PaymentMode.CASH}>CASH</option>
                  <option value={PaymentMode.ONLINE}>ONLINE</option>
                  <option value={PaymentMode.DISCOUNT}>DISCOUNT</option>
                </select>
                <input
                  type="text"
                  placeholder="Reference Id."
                  value={payment.referenceId || ""}
                  disabled={payment.paymentMode === PaymentMode.CASH}
                  onChange={(e) =>
                    updatePayment(index, "referenceId", e.target.value)
                  }
                  className="md:col-span-4 p-2 border rounded disabled:bg-gray-100"
                />
                <button
                  type="button"
                  onClick={() => removePayment(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 leading-none"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addPayment}
            className="mt-4 flex items-center text-brand-gold font-semibold"
          >
            <PlusIcon className="w-5 h-5 mr-1" /> Add Payment
          </button>
        </div>

        {/* Totals and Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex flex-col items-end space-y-2 text-lg">
            <div className="flex justify-between w-full max-w-xs">
              <span>Subtotal:</span>{" "}
              <span className="font-semibold">
                ₹{totalAmount.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between w-full max-w-xs">
              <span>Paid:</span>{" "}
              <span className="font-semibold text-green-600">
                ₹{totalPaid.toLocaleString("en-IN")}
              </span>
            </div>
            <div className="flex justify-between w-full max-w-xs border-t pt-2 mt-2">
              <strong>Balance Due:</strong>{" "}
              <strong className="text-red-600">
                ₹{balanceDue.toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
          <div className="flex justify-end mt-8 space-x-4">
            <button
              type="button"
              onClick={() => navigate("/bills")}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-brand-gold text-brand-dark rounded-md hover:opacity-90 font-semibold"
            >
              {isEditing ? "Update Bill" : "Save Bill"}
            </button>
          </div>
        </div>
      </form>
      {/* Customer Modal for creating new customer */}
      <CustomerFormModal
        isOpen={isCustomerModalOpen}
        onClose={handleCustomerModalClose}
        setCustomerData={setSearchDatalist}
      />
    </>
  );
};

export default BillForm;
