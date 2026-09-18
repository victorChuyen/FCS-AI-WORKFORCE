import React from 'react';
import { Outlet } from 'react-router-dom';
import { FloatingVipContact } from '../components/common/FloatingVipContact';

export const PublicLayout = () => {
  return (
    <>
      <Outlet />
      <FloatingVipContact />
    </>
  );
};
