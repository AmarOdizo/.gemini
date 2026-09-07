import React from 'react';
import { Outlet } from 'react-router-dom';
import OwnerSidebar from '../components/OwnerSidebar';
import VetSidebar from '../components/VetSidebar';

const MainLayout = () => {
  const userStr = localStorage.getItem('currentUser');
  const user = userStr ? JSON.parse(userStr) : null;
  const isDoctor = user && (user.role === 'doctor' || user.vciNumber);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex">
      {isDoctor ? <VetSidebar /> : <OwnerSidebar />}
      <div className="flex-grow ml-0 md:ml-[280px] flex flex-col w-full min-h-screen relative">
        <Outlet />
      </div>
    </div>
  );
};

export default MainLayout;
