import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MenuIcon } from './icons/Icons';

const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-brand-light text-brand-dark">
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      
      <main className="flex-1 transition-all duration-300 md:pl-64">
        <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 sticky top-0 z-20">
            <h1 className="text-xl font-bold text-brand-gold tracking-wider">Khatri Alankar</h1>
            <button onClick={() => setSidebarOpen(true)} className="text-brand-dark">
                <MenuIcon className="h-6 w-6" />
            </button>
        </div>
        <div className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;