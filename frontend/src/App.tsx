import { useState, useCallback, type ReactNode } from 'react';
import { Header, type TabType } from './components/Header';
import { Login } from './components/Login';
import { QuestoesManager } from './components/QuestoesManager';
import { UsuariosManager } from './components/UsuariosManager';
import { AvaliacoesManager } from './components/AvaliacoesManager';
import { DesignacoesManager } from './components/DesignacoesManager';
import { ResponderAvaliacao } from './components/ResponderAvaliacao';
import { RelatoriosHub } from './components/RelatoriosHub';
import { api } from './services/api';
import type { Usuario } from './types';
import { FileText, Layers, ArrowRight, BarChart, UserCheck } from 'lucide-react';

const SESSAO_KEY = 'usuarioLogado';

function lerSessao(): Usuario | null {
  try {
    const salvo = localStorage.getItem(SESSAO_KEY);
    return salvo ? (JSON.parse(salvo) as Usuario) : null;
  } catch {
    return null;
  }
}

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(lerSessao);

  const handleLogin = (usuario: Usuario) => {
    localStorage.setItem(SESSAO_KEY, JSON.stringify(usuario));
    setCurrentUser(usuario);
    setActiveTab('dashboard');
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem(SESSAO_KEY);
    setCurrentUser(null);
  }, []);

  // Após editar/remover colaboradores, atualiza os dados do usuário logado (ou encerra a sessão se ele foi removido)
  const handleRefreshUsuarios = useCallback(async () => {
    if (!currentUser) return;
    try {
      const atualizado = await api.usuarios.buscarPorId(currentUser.idUsuario);
      localStorage.setItem(SESSAO_KEY, JSON.stringify(atualizado));
      setCurrentUser(atualizado);
    } catch {
      handleLogout();
    }
  }, [currentUser, handleLogout]);

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  const atalhos: { tab: TabType; titulo: string; icon: ReactNode; cor: string }[] = [
    { tab: 'questoes', titulo: 'Banco de Questões', icon: <FileText size={20} />, cor: '#2f2c79' },
    { tab: 'avaliacoes', titulo: 'Ciclos & Pesos', icon: <Layers size={20} />, cor: '#ff9800' },
    { tab: 'designacoes', titulo: 'Designações', icon: <UserCheck size={20} />, cor: '#e6a800' },
    { tab: 'relatorios', titulo: 'Relatórios', icon: <BarChart size={20} />, cor: '#171a4a' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#000020]">
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div
              className="rounded-2xl p-6 text-white shadow-xl"
              style={{ background: 'linear-gradient(135deg, #171a4a 0%, #2f2c79 65%, #000020 100%)' }}
            >
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4">
                Olá, {currentUser.nome.split(' ')[0]}!
              </h1>
              <button
                onClick={() => setActiveTab('minhas-avaliacoes')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold text-[#000020] shadow-md transition hover:-translate-y-0.5 cursor-pointer"
                style={{ backgroundColor: '#ff9800' }}
              >
                <span>Responder Avaliações</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {atalhos.map((a) => (
                <div
                  key={a.tab}
                  onClick={() => setActiveTab(a.tab)}
                  className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group flex items-center justify-between"
                >
                  <h3 className="text-base font-bold group-hover:text-[#ff9800] transition">{a.titulo}</h3>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: a.cor }}
                  >
                    {a.icon}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'minhas-avaliacoes' && <ResponderAvaliacao currentUser={currentUser} />}
        {activeTab === 'questoes' && <QuestoesManager />}
        {activeTab === 'avaliacoes' && <AvaliacoesManager />}
        {activeTab === 'designacoes' && <DesignacoesManager />}
        {activeTab === 'relatorios' && <RelatoriosHub currentUser={currentUser} />}
        {activeTab === 'usuarios' && <UsuariosManager onRefreshUsuarios={handleRefreshUsuarios} />}
      </main>
    </div>
  );
}

export default App;
