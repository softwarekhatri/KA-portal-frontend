
import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-brand-dark">Settings</h2>
      <div className="bg-white p-8 rounded-lg shadow-md">
        <p className="text-gray-600">This is the settings page. Future options for configuring the application, such as tax rates or company details, will be available here.</p>
      </div>
    </div>
  );
};

export default Settings;
