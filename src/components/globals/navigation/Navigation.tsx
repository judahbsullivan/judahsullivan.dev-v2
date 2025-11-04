"use client";

import { Menu } from './Menu';
import type { Navigation } from '@/directus/utils/types';

interface NavigationProps {
  navItems: Navigation | null | undefined;
}

export function Navigation({ navItems }: NavigationProps) {
  return (
    <header className="h-16 py-2 bg-blend-difference bg-none z-50 fixed top-0 w-full px-4 mx-auto">
      <div className="flex items-center justify-between w-full">
        <a href="/">
          <p>Judah Sullivan</p>
        </a>
        {navItems && <Menu navItems={navItems} />}
      </div>
    </header>
  );
}

