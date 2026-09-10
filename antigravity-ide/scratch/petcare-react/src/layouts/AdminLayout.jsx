import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[#faf8ff] text-on-surface font-['Hanken_Grotesk'] antialiased">
      {/* Fixed Admin Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="pl-[17.5rem]">
        {/* Fixed Top Header */}
        <AdminHeader />

        {/* Dynamic Nested Route Content */}
        <main className="relative pt-16 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
