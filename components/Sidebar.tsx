import React from "react";
import { NavLink } from "react-router-dom";
import {
  DashboardIcon,
  CustomerIcon,
  BillIcon,
  SettingsIcon,
  XIcon,
} from "./icons/Icons";

interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const navLinkClasses =
    "flex items-center px-4 py-3 text-gray-200 hover:bg-brand-gray hover:text-white rounded-md transition-colors duration-200";
  const activeLinkClasses = "bg-brand-gold text-brand-dark";

  const navItems = [
    {
      to: "/dashboard",
      icon: <DashboardIcon className="h-5 w-5 mr-3" />,
      label: "Dashboard",
    },
    {
      to: "/customers",
      icon: <CustomerIcon className="h-5 w-5 mr-3" />,
      label: "Customers",
    },
    {
      to: "/bills",
      icon: <BillIcon className="h-5 w-5 mr-3" />,
      label: "Bills",
    },
    {
      to: "/settings",
      icon: <SettingsIcon className="h-5 w-5 mr-3" />,
      label: "Settings",
    },
  ];

  return (
    <>
      {/* Mobile-first overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity md:hidden ${
          sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      <div
        className={`fixed top-0 left-0 h-full bg-brand-dark w-64 p-4 z-40 transform transition-transform md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-5">
          <img
            src="/logo.png"
            alt="Khatri Alankar Logo"
            className="h-20 w-20 mx-auto mb-4 rounded-full object-cover "
          />
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-brand-gold tracking-wider mx-auto">
              Khatri Alankar
            </h1>
          </div>
        </div>
        <nav>
          <ul>
            {navItems.map((item) => (
              <li key={item.to} className="mb-2">
                <NavLink
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={({ isActive }) =>
                    `${navLinkClasses} ${isActive ? activeLinkClasses : ""}`
                  }
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
