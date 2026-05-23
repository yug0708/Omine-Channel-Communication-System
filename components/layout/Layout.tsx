
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (
<<<<<<< HEAD
    <div className="flex h-screen bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-dark-bg p-4 sm:p-6">
=======
    <div className="relative z-10 flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="relative z-10 flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-transparent p-4 sm:p-6 lg:p-8">
>>>>>>> d25effb6cab6af83effe1b26eefb8f8659faa69a
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
