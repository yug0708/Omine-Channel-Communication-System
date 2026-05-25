
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout: React.FC = () => {
  return (

    <div className="flex h-screen bg-slate-100 dark:bg-dark-bg text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-100 dark:bg-dark-bg p-4 sm:p-6">

    <div className="relative z-10 flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="relative z-10 flex-1 overflow-x-hidden overflow-y-auto bg-[#F8FAFC] dark:bg-transparent p-4 sm:p-6 lg:p-8">

          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
