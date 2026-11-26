import React from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  HelpCircle,
  UserCheck,
  BarChart3,
  Users,
  UserCircle2,
  LogOut,
} from 'lucide-react';
import type { Usuario } from '../types';

export type TabType =
  | 'dashboard'
  | 'minhas-avaliacoes'
  | 'avaliacoes'
  | 'questoes'
  | 'designacoes'
  | 'relatorios'
  | 'usuarios';

interface HeaderProps {
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  currentUser: Usuario;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onSelectTab, currentUser, onLogout }) => {
  const navItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Início', icon: <LayoutDashboard size={18} /> },
    { id: 'minhas-avaliacoes', label: 'Minhas Avaliações', icon: <ClipboardCheck size={18} /> },
    { id: 'avaliacoes', label: 'Ciclos & Pesos', icon: <Calendar size={18} /> },
    { id: 'questoes', label: 'Questões', icon: <HelpCircle size={18} /> },
    { id: 'designacoes', label: 'Designações', icon: <UserCheck size={18} /> },
    { id: 'relatorios', label: 'Relatórios', icon: <BarChart3 size={18} /> },
    { id: 'usuarios', label: 'Colaboradores', icon: <Users size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-lg border-b border-[#2f2c79]" style={{ backgroundColor: '#171a4a' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-black text-white text-xl"
              style={{ backgroundColor: '#ff9800' }}
            >
              360°
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Avaliações 360°</span>
          </div>

          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-white">
              <UserCircle2 size={20} style={{ color: '#ffcc50' }} />
              <div className="text-left leading-tight">
                <div className="text-sm font-semibold">{currentUser.nome}</div>
                <div className="text-[11px] text-slate-300">
                  {currentUser.cargo} • {currentUser.departamento}
                </div>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm text-white border border-[#2f2c79] hover:bg-[#2f2c79] transition cursor-pointer"
              title="Sair"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-[#2f2c79]/80 bg-[#171a4a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Abas">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive ? 'shadow-sm' : 'text-slate-300 hover:text-white hover:bg-[#2f2c79]/50'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#ff9800' : 'transparent',
                    color: isActive ? '#000020' : undefined,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <span className={isActive ? 'text-[#000020]' : 'text-slate-300'}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
