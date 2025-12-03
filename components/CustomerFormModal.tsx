import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Toast, { ToastType } from "./Toast";
import { Customer } from "../types";
import { backendInstance } from "@/utils/constant";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
  setCustomerData?: React.Dispatch<React.SetStateAction<Customer[]>>;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customer,
  setCustomerData,
}) => {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{
    message: string;
    type: ToastType;
  } | null>(null);

  useEffect(() => {
    if (customer) {
      setName(customer.name);
      setPhone(customer.phone || []);
      setAddress(customer.address || "");
      setError("");
    } else {
      setName("");
      setPhone([]);
      setAddress("");
      setError("");
    }
  }, [customer, isOpen]);

  const updateCustomer = (updatedCustomer: Customer) => {
    backendInstance
      .patch(`/customers/${updatedCustomer._id}`, updatedCustomer)
      .then((response) => {
        console.log("Customer updated successfully:", response.data);
        setCustomerData((prev) =>
          prev.map((c) =>
            c._id === updatedCustomer._id
              ? {
                  ...response.data,
                  totalBills: c.totalBills,
                  totalDues: c.totalDues,
                }
              : c
          )
        );
        setToast({
          message: "Customer updated successfully!",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Error updating customer:", error);
        setToast({ message: "Error while updating customer!", type: "error" });
      });
  };

  const addCustomer = (newCustomer: Customer) => {
    backendInstance
      .post("/customers", newCustomer)
      .then((response) => {
        console.log("Customer added successfully:", response.data);
        setCustomerData((prev) => [
          ...prev,
          { ...response.data, totalBills: 0, totalDues: 0 },
        ]);
        setToast({
          message: "Customer added successfully!",
          type: "success",
        });
      })
      .catch((error) => {
        console.error("Error adding customer:", error);
        setToast({
          message: "Error while adding customer!",
          type: "error",
        });
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    const customerData = {
      name: name.trim(),
      phone: phone,
      address: address.trim(),
    };

    if (customer) {
      updateCustomer({ ...customer, ...customerData });
    } else {
      addCustomer(customerData);
    }
    onClose();
  };

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={customer ? "Edit Customer" : "Add New Customer"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
          </div>
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              value={phone.join(",")}
              onChange={(e) => {
                const phones = e.target.value
                  .split(",")
                  .map((num) => num.trim());
                setPhone(phones);
              }}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <textarea
              id="address"
              rows={3}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brand-gold focus:border-brand-gold sm:text-sm"
            />
          </div>
          <div className="flex justify-end pt-4 space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-brand-gold text-brand-dark rounded-md hover:opacity-90"
            >
              {customer ? "Save Changes" : "Add Customer"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default CustomerFormModal;
