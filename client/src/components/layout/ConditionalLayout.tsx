'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import TopBanner from '@/components/layout/Banner/TopBanner';
import { Header } from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer';

type Props = {
  children: React.ReactNode;
};

const ConditionalLayout: React.FC<Props> = ({ children }) => {
  const pathname = usePathname() || '/';

  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  const isAuthRoute = pathname.startsWith('/auth');

  const showTopBanner = !isAdminRoute && !isAuthRoute;
  const showHeader = !isAdminRoute;
  const showFooter = !isAdminRoute;

  return (
    <>
      {showTopBanner && <TopBanner />}
      {showHeader && <Header />}
      <main>{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

export default ConditionalLayout;
