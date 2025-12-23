import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, FileText, Building2, LogOut, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function Layout({ user, onLogout }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarMinimized, setSidebarMinimized] = useState(false);

  const menuItems = [
    { path: '/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/surat', icon: FileText, label: 'Data Surat' },
    { path: '/unit', icon: Building2, label: 'Data Unit' }
  ];

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const toggleSidebarMinimize = () => {
    setSidebarMinimized(!sidebarMinimized);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar - Full width tanpa terpotong */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 h-16">
        <div className="h-full flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            {/* Toggle button untuk mobile */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Toggle minimize untuk desktop */}
            <button
              onClick={toggleSidebarMinimize}
              className="hidden lg:block text-gray-600 hover:text-gray-900 p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              {sidebarMinimized ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
            </button>
            
            <h1 className="text-base sm:text-lg md:text-xl font-bold text-blue-700 truncate">
              Sistem Arsip Surat - BPN Palembang
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden sm:inline text-sm text-gray-600 font-medium">
              {user?.username}
            </span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar - Desktop (minimize-able) */}
      <aside
        className={`hidden lg:block fixed top-16 left-0 bottom-0 bg-white shadow-lg transition-all duration-300 ease-in-out z-40 ${
          sidebarMinimized ? 'w-20' : 'w-64'
        }`}
      >
        <div className="px-4 py-6 h-full overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  } ${sidebarMinimized ? 'justify-center' : ''}`}
                  title={sidebarMinimized ? item.label : ''}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!sidebarMinimized && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Sidebar - Mobile (overlay) */}
      <aside
        className={`lg:hidden fixed top-16 left-0 bottom-0 w-64 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-4 py-6 h-full overflow-y-auto">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300"
        />
      )}

      {/* Main Content - Menyesuaikan dengan sidebar */}
      <main 
        className={`pt-16 min-h-screen transition-all duration-300 ${
          sidebarMinimized ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default Layout;