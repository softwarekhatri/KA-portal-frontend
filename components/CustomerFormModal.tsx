import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { useData } from "../hooks/useData";
import { Customer } from "../types";

interface CustomerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer?: Customer;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({
  isOpen,
  onClose,
  customer,
}) => {
  const { addCustomer, updateCustomer } = useData();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState<string[]>([]);
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("here customer phone", customer?.phone);
    if (customer) {
      setName(customer.name);
      console.log("here customer phone", customer.phone);
      // setPhone(customer.phone || "");
      setAddress(customer.address || "");
      setError("");
    } else {
      setName("");
      setPhone("");
      setAddress("");
      setError("");
    }
  }, [customer, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name is required.");
      return;
    }

    const customerData = {
      name: name.trim(),
      // phone: phone.trim(),
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
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
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
  );
};

export default CustomerFormModal;
