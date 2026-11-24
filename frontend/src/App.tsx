import { useState, useCallback } from 'react';
import { Header, type TabType } from './components/Header';
import { QuestoesManager } from './components/QuestoesManager';
import { UsuariosManager } from './components/UsuariosManager';
import { AvaliacoesManager } from './components/AvaliacoesManager';
import { DesignacoesManager } from './components/DesignacoesManager';
import { ResponderAvaliacao } from './components/ResponderAvaliacao';
import { RelatoriosHub } from './components/RelatoriosHub';
import type { Usuario } from './types';
import {
  FileText,
  Layers,
  Sparkles,
  ArrowRight,
  Database,
  BarChart,
  UserCheck,
  CheckCircle,
} from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [userRefreshKey, setUserRefreshKey] = useState(0);

  const handleRefreshUsuarios = useCallback(() => {
    setUserRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-[#000020]">
      {/* Topbar com navegação por abas e seletor rápido de perfil */}
      <Header
        key={userRefreshKey}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentUser={currentUser}
        onSelectUser={setCurrentUser}
      />

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner de Boas-Vindas */}
        <div
          className="rounded-2xl p-6 mb-8 text-white shadow-xl relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #171a4a 0%, #2f2c79 65%, #000020 100%)',
          }}
        >
          <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-end pr-8">
            <Database size={240} />
          </div>

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 border border-[#ff9800]/40 bg-[#ff9800]/20 text-[#ffcc50]">
              <Sparkles size={14} className="text-[#ff9800]" />
              <span>Avaliação de Desempenho 360° • UEL Banco de Dados I</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
              Olá{currentUser ? `, ${currentUser.nome.split(' ')[0]}` : ''}!
            </h1>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed mb-4">
              Sistema com banco de dados PostgreSQL, back-end em Java/Spring Boot com JDBC puro (DAO),
              e front-end em React com suporte aos 5 relatórios analíticos, pesos ponderados por competência e particularidade de avaliação 360°.
            </p>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveTab('minhas-avaliacoes')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-bold text-[#000020] shadow-md transition transform hover:-translate-y-0.5 cursor-pointer"
                style={{ backgroundColor: '#ff9800' }}
              >
                <span>Responder Avaliações</span>
                <ArrowRight size={16} />
              </button>

              <button
                onClick={() => setActiveTab('questoes')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-[#ffcc50]/40 hover:bg-white/10 transition cursor-pointer"
              >
                <FileText size={16} className="text-[#ffcc50]" />
                <span>Gerenciar Questões (RF1)</span>
              </button>

              <button
                onClick={() => setActiveTab('relatorios')}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold text-white border border-[#ffcc50]/40 hover:bg-white/10 transition cursor-pointer"
              >
                <BarChart size={16} className="text-[#ffcc50]" />
                <span>Ver 5 Relatórios SQL</span>
              </button>
            </div>
          </div>
        </div>

        {/* Visualização por Aba */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div
                onClick={() => setActiveTab('questoes')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    RF1 • Questões
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#2f2c79' }}
                  >
                    <FileText size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold group-hover:text-[#ff9800] transition">
                  Banco de Questões
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Múltipla escolha e texto livre para competências.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('avaliacoes')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    RF2 & RF3 • Ciclos
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#ff9800' }}
                  >
                    <Layers size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold group-hover:text-[#ff9800] transition">
                  Ciclos & Pesos (RF6)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Composição de critérios com ponderação estratégica.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('designacoes')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    RF4 • Atribuições
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-[#000020]"
                    style={{ backgroundColor: '#ffcc50' }}
                  >
                    <UserCheck size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold group-hover:text-[#ff9800] transition">
                  Designações 360°
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Matriz de quem avalia quem no ciclo.
                </p>
              </div>

              <div
                onClick={() => setActiveTab('relatorios')}
                className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    RF7 • Analytics
                  </span>
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                    style={{ backgroundColor: '#171a4a' }}
                  >
                    <BarChart size={20} />
                  </div>
                </div>
                <h3 className="text-lg font-bold group-hover:text-[#ff9800] transition">
                  5 Relatórios SQL
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Tabelas e gráficos (Radar, Barras, Linha, Rosca).
                </p>
              </div>
            </div>

            {/* Status da Fase 6 */}
            <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle size={22} className="text-emerald-500" />
                <div>
                  <h2 className="text-base font-bold text-[#171a4a]">
                    Fase 6 Concluída: Hub dos 5 Relatórios Analíticos com Tabelas & Gráficos Chart.js (RF7)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Página contínua com rolagem, sumário rápido de âncoras, gráficos interativos (Barras, Radar, Linhas, Rosca) e acordions com SQLs explicados.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div
                  onClick={() => setActiveTab('relatorios')}
                  className="p-4 rounded-xl border border-slate-200 bg-amber-50/40 hover:bg-amber-50 transition cursor-pointer"
                >
                  <h4 className="text-xs font-bold text-[#ff9800] uppercase tracking-wider mb-1">
                    5 Relatórios SQL (RF7) →
                  </h4>
                  <p className="text-xs text-slate-600">
                    Tabelas e gráficos com 100% dos recursos exigidos.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('minhas-avaliacoes')}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
                >
                  <h4 className="text-xs font-bold text-[#2f2c79] uppercase tracking-wider mb-1">
                    Responder Avaliações (RF5) →
                  </h4>
                  <p className="text-xs text-slate-600">
                    Questionários preenchidos pelo colaborador.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('avaliacoes')}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
                >
                  <h4 className="text-xs font-bold text-[#2f2c79] uppercase tracking-wider mb-1">
                    Ciclos & Pesos (RF2/3/6) →
                  </h4>
                  <p className="text-xs text-slate-600">
                    Pesos ponderados por critério.
                  </p>
                </div>

                <div
                  onClick={() => setActiveTab('designacoes')}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 transition cursor-pointer"
                >
                  <h4 className="text-xs font-bold text-[#2f2c79] uppercase tracking-wider mb-1">
                    Designações 360° (RF4) →
                  </h4>
                  <p className="text-xs text-slate-600">
                    Acompanhamento de quem avalia quem.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Aba de Minhas Avaliações / Responder (RF5) */}
        {activeTab === 'minhas-avaliacoes' && (
          <ResponderAvaliacao currentUser={currentUser} />
        )}

        {/* Aba de Questões (RF1) */}
        {activeTab === 'questoes' && <QuestoesManager />}

        {/* Aba de Ciclos & Pesos (RF2, RF3, RF6) */}
        {activeTab === 'avaliacoes' && <AvaliacoesManager />}

        {/* Aba de Designações 360° (RF4) */}
        {activeTab === 'designacoes' && <DesignacoesManager />}

        {/* Aba de Relatórios Analíticos (RF7) */}
        {activeTab === 'relatorios' && (
          <RelatoriosHub currentUser={currentUser} />
        )}

        {/* Aba de Usuários / Colaboradores */}
        {activeTab === 'usuarios' && (
          <UsuariosManager onRefreshUsuarios={handleRefreshUsuarios} />
        )}
      </main>

      {/* Rodapé institucional */}
      <footer className="bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500">
          Trabalho Prático de Banco de Dados I • UEL • Prof. Dr. Anderson Paulo Avila Santos • 2026
        </div>
      </footer>
    </div>
  );
}

export default App;
