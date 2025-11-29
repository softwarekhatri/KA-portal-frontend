import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "../hooks/useData";
import { Customer, Bill, BillItem, Payment, PaymentMode } from "../types";
import { calculateBillTotals } from "../utils/calculations";
import { PlusIcon, TrashIcon, ChevronLeftIcon } from "./icons/Icons";

const BillForm: React.FC = () => {
  const { billId } = useParams();
  const navigate = useNavigate();
  const { customers, addBill, updateBill, getBillById } = useData();

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [customerSearch, setCustomerSearch] = useState("");
  const [searchDatalist, setSearchDatalist] = useState<Customer[]>([]);

  const [billDate, setBillDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [items, setItems] = useState<BillItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  const isEditing = Boolean(billId);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setCustomerSearch(term);
    if (term.length > 1) {
      setSearchDatalist(
        customers.filter(
          (c) =>
            c.name.toLowerCase().includes(term.toLowerCase()) ||
            c.phone?.includes(term) ||
            c.address?.toLowerCase().includes(term.toLowerCase())
        )
      );
    } else {
      setSearchDatalist([]);
    }
  };

  const selectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setCustomerSearch(customer.name);
    setSearchDatalist([]);
  };

  useEffect(() => {
    if (isEditing && getBillById) {
      const bill = getBillById(billId);
      if (bill) {
        const customer = customers.find((c) => c.id === bill.customerId);
        setSelectedCustomer(customer || null);
        if (customer) setCustomerSearch(customer.name);
        setBillDate(bill.date);
        setItems(bill.items);
        setPayments(bill.payments);
      }
    } else {
      // New bill defaults
      addItem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billId, getBillById, isEditing, customers]);

  // Items management
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        name: "",
        weight: 0,
        rate: 0,
        makingCharge: 0,
        discount: 0,
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
        id: Date.now().toString(),
        amount: 0,
        date: new Date().toISOString().split("T")[0],
        mode: PaymentMode.CASH,
        reference: "",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) {
      alert("Please select a customer.");
      return;
    }

    const billData = {
      customerId: selectedCustomer.id,
      date: billDate,
      items: items.filter(
        (item) => item.name && item.weight > 0 && item.rate > 0
      ),
      payments: payments.filter((p) => p.amount > 0),
    };

    if (isEditing && billId) {
      updateBill({ id: billId, ...billData });
    } else {
      addBill(billData);
    }
    navigate("/bills");
  };

  const getItemPrice = useCallback((item: BillItem) => {
    return (item.weight * item.rate) / 10 + item.makingCharge - item.discount;
  }, []);

  return (
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
            />
            {searchDatalist.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto">
                {searchDatalist.map((c) => (
                  <li
                    key={c.id}
                    onClick={() => selectCustomer(c)}
                    className="p-2 hover:bg-brand-gold hover:text-white cursor-pointer group"
                  >
                    <div className="font-semibold">
                      {c.name} - {c.phone || "N/A"}
                    </div>
                    <div className="text-xs text-gray-600 group-hover:text-white">
                      {c.address || "No address"}
                    </div>
                  </li>
                ))}
              </ul>
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
          <div className="mt-4 p-4 bg-brand-light rounded-md border border-brand-gold/50">
            <p>
              <strong>Name:</strong> {selectedCustomer.name}
            </p>
            <p>
              <strong>Phone:</strong> {selectedCustomer.phone || "N/A"}
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
              key={item.id}
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
                value={item.weight || ""}
                onChange={(e) => updateItem(index, "weight", e.target.value)}
                className="md:col-span-1 p-2 border rounded"
              />
              <input
                type="number"
                placeholder="Rate/10g"
                value={item.rate || ""}
                onChange={(e) => updateItem(index, "rate", e.target.value)}
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
                onChange={(e) => updateItem(index, "discount", e.target.value)}
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
              key={payment.id}
              className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 border rounded-md relative"
            >
              <input
                type="number"
                placeholder="Amount Paid"
                value={payment.amount || ""}
                onChange={(e) =>
                  updatePayment(index, "amount", parseFloat(e.target.value))
                }
                className="md:col-span-3 p-2 border rounded"
              />
              <input
                type="date"
                value={payment.date}
                onChange={(e) => updatePayment(index, "date", e.target.value)}
                className="md:col-span-3 p-2 border rounded"
              />
              <select
                value={payment.mode}
                onChange={(e) => updatePayment(index, "mode", e.target.value)}
                className="md:col-span-2 p-2 border rounded bg-white"
              >
                <option value={PaymentMode.CASH}>CASH</option>
                <option value={PaymentMode.ONLINE}>ONLINE</option>
              </select>
              <input
                type="text"
                placeholder="Reference No."
                value={payment.reference || ""}
                disabled={payment.mode === PaymentMode.CASH}
                onChange={(e) =>
                  updatePayment(index, "reference", e.target.value)
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
  );
};

export default BillForm;
