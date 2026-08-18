import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { GlobalFilterBar } from './GlobalFilterBar';
import { BackgroundOrbs } from './BackgroundOrbs';

export const Layout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#050816] text-slate-100 flex relative overflow-x-hidden selection:bg-blue-500/30 selection:text-blue-200">
      {/* Dynamic 3D Ambient Mesh Background */}
      <BackgroundOrbs />

      {/* Sidebar Navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Backdrop for mobile */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-md lg:hidden transition-opacity"
        />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        <Header onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
        <GlobalFilterBar />

        <main className="flex-1 p-4 lg:p-8 max-w-[1600px] w-full mx-auto space-y-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
