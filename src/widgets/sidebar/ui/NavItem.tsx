import React from 'react';
import { Link } from '@tanstack/react-router';
import { cn } from '@/shared/lib/cn';

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  to: string;
  params?: Record<string, string>;
  exact?: boolean;
}

export const NavItem: React.FC<NavItemProps> = ({
  icon,
  label,
  to,
  params,
  exact = false,
}) => (
  <Link
    to={to}
    params={params}
    preload="intent"
    className={cn(
      'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all',
      'text-slate-400 hover:bg-slate-800 hover:text-white'
    )}
    activeProps={{
      className: 'bg-blue-600 text-white shadow-lg shadow-blue-600/20',
    }}
    activeOptions={{ exact }}
  >
    {icon}
    <span className="font-bold text-sm uppercase tracking-wider">{label}</span>
  </Link>
);
