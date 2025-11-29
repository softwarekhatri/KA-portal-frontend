import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Customer, Bill } from "../types";

interface DataContextType {
  customers: Customer[];
  bills: Bill[];
  addCustomer: (customer: Omit<Customer, "id">) => Customer;
  updateCustomer: (customer: Customer) => void;
  deleteCustomer: (customerId: string) => void;
  getCustomerById: (customerId: string) => Customer | undefined;
  addBill: (bill: Omit<Bill, "id">) => Bill;
  updateBill: (bill: Bill) => void;
  deleteBill: (billId: string) => void;
  getBillById: (billId: string) => Bill | undefined;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const useLocalStorage = <T,>(
  key: string,
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = JSON.stringify(storedValue);
      window.localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export const DataProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [customers, setCustomers] = useLocalStorage<Customer[]>(
    "khatri_alankar_customers",
    []
  );
  const [bills, setBills] = useLocalStorage<Bill[]>("khatri_alankar_bills", []);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data load
    setTimeout(() => {
      if (localStorage.getItem("khatri_alankar_customers") === null) {
        setCustomers([
          // {
          //   id: "1",
          //   name: "Rohan Sharma",
          //   phone: "9876543210",
          //   address: "123, MG Road, Delhi",
          // },
          // {
          //   id: "2",
          //   name: "Priya Verma",
          //   phone: "8765432109",
          //   address: "456, Park Street, Kolkata",
          // },
        ]);
      }
      if (localStorage.getItem("khatri_alankar_bills") === null) {
        setBills([]);
      }
      setIsLoading(false);
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addCustomer = (customerData: Omit<Customer, "id">): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      _id: Date.now().toString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    return newCustomer;
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c._id === updatedCustomer._id ? updatedCustomer : c))
    );
  };

  const deleteCustomer = (customerId: string) => {
    if (
      window.confirm(
        "Are you sure you want to delete this customer? This will also delete all their bills."
      )
    ) {
      setCustomers((prev) => prev.filter((c) => c._id !== customerId));
      setBills((prev) => prev.filter((b) => b.customerId !== customerId));
    }
  };

  const getCustomerById = (customerId: string) => {
    return customers.find((c) => c._id === customerId);
  };

  const addBill = (billData: Omit<Bill, "id">): Bill => {
    const newBill: Bill = {
      ...billData,
      id: `KA-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };
    setBills((prev) => [...prev, newBill]);
    return newBill;
  };

  const updateBill = (updatedBill: Bill) => {
    setBills((prev) =>
      prev.map((b) => (b.id === updatedBill.id ? updatedBill : b))
    );
  };

  const deleteBill = (billId: string) => {
    if (window.confirm("Are you sure you want to delete this bill?")) {
      setBills((prev) => prev.filter((b) => b.id !== billId));
    }
  };

  const getBillById = (billId: string) => {
    return bills.find((b) => b.id === billId);
  };

  const value = {
    customers,
    bills,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    addBill,
    updateBill,
    deleteBill,
    getBillById,
    isLoading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
