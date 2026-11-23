import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  ClipboardCheck,
  Calendar,
  HelpCircle,
  UserCheck,
  BarChart3,
  Users,
  UserCircle2,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import type { Usuario } from '../types';
import { api } from '../services/api';

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
  currentUser: Usuario | null;
  onSelectUser: (user: Usuario) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onSelectUser,
}) => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    carregarUsuarios();
  }, []);

  const carregarUsuarios = async () => {
    try {
      const lista = await api.usuarios.listar();
      setUsuarios(lista);
      setApiOnline(true);
      // Se não tiver usuário selecionado, seleciona o primeiro por padrão
      if (!currentUser && lista.length > 0) {
        onSelectUser(lista[0]);
      }
    } catch {
      setApiOnline(false);
    }
  };

  const navItems: { id: TabType; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { id: 'minhas-avaliacoes', label: 'Minhas Avaliações', icon: <ClipboardCheck size={18} /> },
    { id: 'avaliacoes', label: 'Ciclos & Pesos', icon: <Calendar size={18} /> },
    { id: 'questoes', label: 'Questões', icon: <HelpCircle size={18} /> },
    { id: 'designacoes', label: 'Designações', icon: <UserCheck size={18} /> },
    { id: 'relatorios', label: 'Relatórios 360°', icon: <BarChart3 size={18} />, badge: '5 SQLs' },
    { id: 'usuarios', label: 'Colaboradores', icon: <Users size={18} /> },
  ];

  return (
    <header className="sticky top-0 z-50 shadow-lg border-b border-[#2f2c79]" style={{ backgroundColor: '#171a4a' }}>
      {/* Barra superior de status e identificação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Título */}
          <div className="flex items-center space-x-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md font-black text-white text-xl"
              style={{ backgroundColor: '#ff9800' }}
            >
              360°
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-white font-bold text-lg tracking-tight">Avaliações 360°</span>
                <span
                  className="px-2 py-0.5 text-xs font-semibold rounded-full text-[#000020]"
                  style={{ backgroundColor: '#ffcc50' }}
                >
                  Banco de Dados I
                </span>
              </div>
              <p className="text-xs text-slate-300">UEL • Sistema de Avaliação de Desempenho</p>
            </div>
          </div>

          {/* Área do Usuário Logado + Simulador de Perfil */}
          <div className="flex items-center space-x-4">
            {/* Indicador de Status da API */}
            <div className="hidden sm:flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full bg-[#2f2c79]/60 text-white border border-indigo-400/20">
              {apiOnline === true && (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-emerald-300 font-medium">API 8080 Ativa</span>
                </>
              )}
              {apiOnline === false && (
                <>
                  <AlertCircle size={13} className="text-amber-400" />
                  <span className="text-amber-300 font-medium">API Desconectada</span>
                </>
              )}
              {apiOnline === null && (
                <span className="text-slate-300">Conectando...</span>
              )}
            </div>

            {/* Dropdown de Simulação / Perfil */}
            <div className="relative">
              <button
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-white transition-colors duration-150 border border-[#2f2c79]"
                style={{ backgroundColor: '#2f2c79' }}
              >
                <UserCircle2 size={18} style={{ color: '#ffcc50' }} />
                <div className="text-left">
                  <div className="text-xs font-semibold leading-tight flex items-center gap-1.5">
                    <span>{currentUser ? currentUser.nome : 'Selecionar Usuário'}</span>
                    <Sparkles size={11} style={{ color: '#ff9800' }} />
                  </div>
                  <div className="text-[10px] text-slate-300 leading-tight">
                    {currentUser ? `${currentUser.cargo} (${currentUser.departamento})` : 'Simular perfil'}
                  </div>
                </div>
                <ChevronDown size={14} className="text-slate-300 ml-1" />
              </button>

              {/* Menu dropdown */}
              {showUserDropdown && (
                <div
                  className="absolute right-0 mt-2 w-72 rounded-xl shadow-2xl py-2 z-50 border border-slate-700 bg-[#171a4a] text-white"
                >
                  <div className="px-3 py-1.5 border-b border-slate-700/60">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-[#ffcc50]">
                      Alternar Perfil (Pitch & Demonstração)
                    </p>
                    <p className="text-[11px] text-slate-300">
                      Veja a tela sob o ponto de vista de outro colaborador:
                    </p>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-slate-800">
                    {usuarios.map((u) => {
                      const isSelected = currentUser?.idUsuario === u.idUsuario;
                      return (
                        <button
                          key={u.idUsuario}
                          onClick={() => {
                            onSelectUser(u);
                            setShowUserDropdown(false);
                          }}
                          className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-[#2f2c79] transition ${
                            isSelected ? 'bg-[#2f2c79] text-[#ffcc50] font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{u.nome}</div>
                            <div className="text-[10px] text-slate-400">{u.cargo} • {u.departamento}</div>
                          </div>
                          {isSelected && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ff9800] text-[#000020] font-bold">
                              Ativo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Abas de Navegação (Tabs no Topo) */}
      <div className="border-t border-[#2f2c79]/80 bg-[#171a4a]/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 overflow-x-auto py-1 scrollbar-none" aria-label="Abas">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'text-white shadow-sm'
                      : 'text-slate-300 hover:text-white hover:bg-[#2f2c79]/50'
                  }`}
                  style={{
                    backgroundColor: isActive ? '#ff9800' : 'transparent',
                    color: isActive ? '#000020' : undefined,
                    fontWeight: isActive ? 700 : 500,
                  }}
                >
                  <span className={isActive ? 'text-[#000020]' : 'text-slate-300'}>{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-[#171a4a] text-[#ffcc50]'
                          : 'bg-[#ff9800]/20 text-[#ffcc50]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
