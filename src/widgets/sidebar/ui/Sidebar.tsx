import React from 'react';
import {
  LayoutDashboard,
  Settings,
  MonitorPlay,
  Package,
  ClipboardList,
  Factory,
  ListTodo,
  Users,
  UserCog,
  LogOut,
} from 'lucide-react';
import { useRouterState } from '@tanstack/react-router';
import { NavItem } from './NavItem';
import { useUserStore } from '@/entities/user';
import { useAppNavigate } from '@/shared/hooks';

export function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const logout = useUserStore((s) => s.logout);
  const { toLogin, toOperator } = useAppNavigate();

  const handleLogout = () => {
    logout();
    toLogin();
  };

  return (
    <aside className="w-64 h-full bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Factory className="w-6 h-6 text-white" />
        </div>
        <span className="font-black tracking-tighter text-xl text-white">
          STRUCTURA
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        <NavItem
          icon={<LayoutDashboard size={20} />}
          label="Dashboard"
          to="/"
          exact
        />
        <button
          type="button"
          onClick={() => toOperator()}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
            pathname.startsWith('/operator')
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
              : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`}
        >
          <MonitorPlay size={20} />
          <span className="font-bold text-sm uppercase tracking-wider">
            Terminal
          </span>
        </button>
        <NavItem
          icon={<ClipboardList size={20} />}
          label="Proyectos"
          to="/projects"
        />
        <NavItem icon={<ListTodo size={20} />} label="Producción" to="/orders" />
        <NavItem icon={<Package size={20} />} label="Stock" to="/inventory" />
        <NavItem icon={<Users size={20} />} label="Clientes" to="/clients" />
        <NavItem icon={<UserCog size={20} />} label="Usuarios" to="/users" />
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <NavItem
          icon={<Settings size={20} />}
          label="Ajustes"
          to="/settings/$tab"
          params={{ tab: 'general' }}
        />
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-all font-bold text-xs uppercase tracking-widest"
        >
          <LogOut size={20} /> Salir
        </button>
      </div>
    </aside>
  );
}
