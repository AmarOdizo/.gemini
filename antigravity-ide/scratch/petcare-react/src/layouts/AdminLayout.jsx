import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminHeader from '../components/admin/AdminHeader';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error("Admin Page Error:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-xl mx-auto mt-12 bg-white rounded-2xl border border-error/20 shadow-sm text-center">
          <span className="material-symbols-outlined text-error text-4xl mb-2">error</span>
          <h2 className="text-lg font-bold text-on-surface">Unable to load admin view</h2>
          <p className="text-xs text-on-surface-variant mt-1 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button
            onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
            className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:opacity-90 transition-opacity"
          >
            Reload Admin View
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#faf8ff] text-on-surface font-['Hanken_Grotesk'] antialiased">
      {/* Mobile/Tablet Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar - Responsive Drawer for Mobile/Tablet, Fixed on Desktop */}
      <AdminSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content Area - Full width on Mobile/Tablet, offset on Desktop (lg:) */}
      <div className="lg:pl-72 flex flex-col min-h-screen transition-all duration-300">
        {/* Fixed Top Header */}
        <AdminHeader
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* Dynamic Nested Route Content wrapped in Error Boundary */}
        <main className="relative pt-16 flex-1 w-full overflow-x-hidden">
          <AdminErrorBoundary>
            <Outlet />
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
