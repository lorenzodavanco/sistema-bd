import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler,
} from 'chart.js';
import { Bar, Radar, Line, Doughnut } from 'react-chartjs-2';
import {
  BarChart3,
  TrendingUp,
  AlertTriangle,
  Award,
  Radar as RadarIcon,
  Filter,
  Code2,
  ChevronDown,
  ChevronUp,
  Users,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import type {
  Avaliacao,
  Usuario,
  RelatorioConsolidado,
  RelatorioRadar,
  RelatorioEvolucao,
  RelatorioPendencia,
  RelatorioRanking,
} from '../types';
import { api } from '../services/api';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  RadialLinearScale,
  ArcElement,
  Filler
);

interface RelatoriosHubProps {
  currentUser: Usuario | null;
}

export const RelatoriosHub: React.FC<RelatoriosHubProps> = ({ currentUser }) => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loadingBase, setLoadingBase] = useState(true);

  const [avaliacaoId, setAvaliacaoId] = useState<number | ''>('');
  const [avaliadoId, setAvaliadoId] = useState<number | ''>('');

  const [minAvaliadores, setMinAvaliadores] = useState<number>(1);
  const [dataInicioEvolucao, setDataInicioEvolucao] = useState<string>('2025-01-01');
  const [dataFimEvolucao, setDataFimEvolucao] = useState<string>('2026-12-31');
  const [departamentoRanking, setDepartamentoRanking] = useState<string>('');
  const [limiteRanking, setLimiteRanking] = useState<number>(10);
  const [departamentosPendencias, setDepartamentosPendencias] = useState<string[]>([]);

  const [dadosR1, setDadosR1] = useState<RelatorioConsolidado[]>([]);
  const [dadosR2, setDadosR2] = useState<RelatorioRadar[]>([]);
  const [dadosR3, setDadosR3] = useState<RelatorioEvolucao[]>([]);
  const [dadosR4, setDadosR4] = useState<RelatorioPendencia[]>([]);
  const [dadosR5, setDadosR5] = useState<RelatorioRanking[]>([]);
  const [resumoPendencias, setResumoPendencias] = useState<{ concluidas: number; pendentes: number } | null>(null);

  const [loadingR1, setLoadingR1] = useState(false);
  const [loadingR2, setLoadingR2] = useState(false);
  const [loadingR3, setLoadingR3] = useState(false);
  const [loadingR4, setLoadingR4] = useState(false);
  const [loadingR5, setLoadingR5] = useState(false);
  const [erroRelatorios, setErroRelatorios] = useState<{ [key: string]: string }>({});

  const [showSql, setShowSql] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    carregarDadosBase();
  }, []);

  const carregarDadosBase = async () => {
    setLoadingBase(true);
    try {
      const [listaAv, listaUsr] = await Promise.all([
        api.avaliacoes.listar(),
        api.usuarios.listar(),
      ]);
      setAvaliacoes(listaAv);
      setUsuarios(listaUsr);

      if (listaAv.length > 0) {
        const padraoAv = listaAv.find((a) => a.idAvaliacao === 3) || listaAv[0];
        setAvaliacaoId(padraoAv.idAvaliacao);
      }

      if (listaUsr.length > 0) {
        const idPadrao = currentUser?.idUsuario || (listaUsr.length > 1 ? listaUsr[1].idUsuario : listaUsr[0].idUsuario);
        setAvaliadoId(idPadrao);
      }
    } catch (err) {
      console.error('Erro ao carregar dados base para relatórios:', err);
    } finally {
      setLoadingBase(false);
    }
  };

  useEffect(() => {
    if (avaliacaoId) carregarR1(Number(avaliacaoId), minAvaliadores);
  }, [avaliacaoId, minAvaliadores]);

  useEffect(() => {
    if (avaliacaoId && avaliadoId) carregarR2(Number(avaliacaoId), Number(avaliadoId));
  }, [avaliacaoId, avaliadoId]);

  useEffect(() => {
    if (avaliadoId) carregarR3(Number(avaliadoId), dataInicioEvolucao, dataFimEvolucao);
  }, [avaliadoId, dataInicioEvolucao, dataFimEvolucao]);

  useEffect(() => {
    if (avaliacaoId) carregarR4(Number(avaliacaoId), departamentosPendencias);
  }, [avaliacaoId, departamentosPendencias, usuarios]);

  useEffect(() => {
    if (avaliacaoId) carregarR5(Number(avaliacaoId), departamentoRanking, limiteRanking);
  }, [avaliacaoId, departamentoRanking, limiteRanking]);

  const carregarR1 = async (idAv: number, minAv: number) => {
    setLoadingR1(true);
    try {
      const res = await api.relatorios.consolidado(idAv, minAv);
      setDadosR1(res);
      setErroRelatorios((prev) => ({ ...prev, r1: '' }));
    } catch (e) {
      console.error(e);
      setErroRelatorios((prev) => ({ ...prev, r1: 'Não foi possível carregar o consolidado. Verifique a conexão com a API.' }));
    } finally {
      setLoadingR1(false);
    }
  };

  const carregarR2 = async (idAv: number, idUsr: number) => {
    setLoadingR2(true);
    try {
      const res = await api.relatorios.competencias(idAv, idUsr);
      setDadosR2(res);
      setErroRelatorios((prev) => ({ ...prev, r2: '' }));
    } catch (e) {
      console.error(e);
      setErroRelatorios((prev) => ({ ...prev, r2: 'Não foi possível carregar o radar. Verifique a conexão com a API.' }));
    } finally {
      setLoadingR2(false);
    }
  };

  const carregarR3 = async (idUsr: number, dtInicio: string, dtFim: string) => {
    setLoadingR3(true);
    try {
      const res = await api.relatorios.evolucao(idUsr, dtInicio, dtFim);
      setDadosR3(res);
      setErroRelatorios((prev) => ({ ...prev, r3: '' }));
    } catch (e) {
      console.error(e);
      setErroRelatorios((prev) => ({ ...prev, r3: 'Não foi possível carregar a evolução. Verifique a conexão com a API.' }));
    } finally {
      setLoadingR3(false);
    }
  };

  const carregarR4 = async (idAv: number, deps: string[]) => {
    setLoadingR4(true);
    try {
      const [pendencias, todasDesignacoes] = await Promise.all([
        api.relatorios.pendencias(idAv, deps),
        api.designacoes.listar({ idAvaliacao: idAv }),
      ]);
      // rosca: só designações dos departamentos filtrados
      const depPorUsuario = new Map(usuarios.map((u) => [u.idUsuario, u.departamento]));
      const designacoes = deps.length === 0
        ? todasDesignacoes
        : todasDesignacoes.filter((d) => deps.includes(depPorUsuario.get(d.idAvaliador) ?? ''));
      setDadosR4(pendencias);
      setResumoPendencias({
        concluidas: Math.max(0, designacoes.length - pendencias.length),
        pendentes: pendencias.length,
      });
      setErroRelatorios((prev) => ({ ...prev, r4: '' }));
    } catch (e) {
      console.error(e);
      setResumoPendencias(null);
      setErroRelatorios((prev) => ({ ...prev, r4: 'Não foi possível carregar o status das designações. Verifique a conexão com a API.' }));
    } finally {
      setLoadingR4(false);
    }
  };

  const carregarR5 = async (idAv: number, dept: string, lim: number) => {
    setLoadingR5(true);
    try {
      const res = await api.relatorios.ranking(idAv, dept || undefined, lim);
      setDadosR5(res);
      setErroRelatorios((prev) => ({ ...prev, r5: '' }));
    } catch (e) {
      console.error(e);
      setErroRelatorios((prev) => ({ ...prev, r5: 'Não foi possível carregar o ranking. Verifique a conexão com a API.' }));
    } finally {
      setLoadingR5(false);
    }
  };

  const departamentosDisponiveis = Array.from(new Set(usuarios.map((u) => u.departamento))).sort();

  const toggleDepartamentoPendencias = (dep: string) => {
    setDepartamentosPendencias((prev) =>
      prev.includes(dep) ? prev.filter((d) => d !== dep) : [...prev, dep]
    );
  };

  const toggleSql = (key: string) => {
    setShowSql((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };


  const chartR1Data = {
    labels: dadosR1.map((d) => d.nome.split(' ')[0] + ' ' + (d.nome.split(' ')[1] || '')),
    datasets: [
      {
        label: 'Média Ponderada AvaliaMAX',
        data: dadosR1.map((d) => d.media_ponderada),
        backgroundColor: '#2f2c79',
        hoverBackgroundColor: '#ff9800',
        borderRadius: 6,
      },
    ],
  };

  const chartR1Options: any = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => ` Nota Ponderada: ${ctx.parsed.x} / 4.00`,
        },
      },
    },
    scales: {
      x: { min: 0, max: 4, grid: { color: '#f1f5f9' } },
      y: { grid: { display: false } },
    },
  };

  const chartR2Data = {
    labels: dadosR2.map((d) =>
      d.competencia.length > 25 ? d.competencia.substring(0, 25) + '...' : d.competencia
    ),
    datasets: [
      {
        label: 'Média do Avaliado',
        data: dadosR2.map((d) => d.media_avaliado),
        backgroundColor: 'rgba(255, 152, 0, 0.35)',
        borderColor: '#ff9800',
        pointBackgroundColor: '#ff9800',
        pointBorderColor: '#fff',
        borderWidth: 2,
      },
      {
        label: 'Média Geral da Empresa',
        data: dadosR2.map((d) => d.media_geral_empresa),
        backgroundColor: 'rgba(47, 44, 121, 0.2)',
        borderColor: '#2f2c79',
        pointBackgroundColor: '#2f2c79',
        pointBorderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const chartR2Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 0,
        max: 4,
        ticks: { stepSize: 1, backdropColor: 'transparent' },
        grid: { color: '#e2e8f0' },
        angleLines: { color: '#cbd5e1' },
      },
    },
    plugins: {
      legend: { position: 'top' as const },
    },
  };

  const chartR3Data = {
    labels: dadosR3.map((d) => d.ciclo),
    datasets: [
      {
        label: 'Evolução da Média Ponderada',
        data: dadosR3.map((d) => d.media_ponderada),
        borderColor: '#ff9800',
        backgroundColor: 'rgba(255, 152, 0, 0.15)',
        pointBackgroundColor: '#2f2c79',
        pointBorderColor: '#ffcc50',
        pointBorderWidth: 2,
        pointRadius: 6,
        fill: true,
        tension: 0.3,
      },
    ],
  };

  const chartR3Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: { min: 1, max: 4, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
    plugins: {
      legend: { display: false },
    },
  };

  const totalPendentesR4 = resumoPendencias?.pendentes ?? 0;
  const totalConcluidasR4 = resumoPendencias?.concluidas ?? 0;

  const chartR4Data = {
    labels: ['Concluídas', 'Pendentes'],
    datasets: [
      {
        data: [totalConcluidasR4, totalPendentesR4],
        backgroundColor: ['#10b981', '#ff9800'],
        borderWidth: 0,
      },
    ],
  };

  const chartR4Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' as const },
    },
    cutout: '70%',
  };

  const chartR5Data = {
    labels: dadosR5.map((d) => `#${d.posicao_ranking} ${d.nome.split(' ')[0]}`),
    datasets: [
      {
        label: 'Média Ponderada',
        data: dadosR5.map((d) => d.media_ponderada),
        backgroundColor: dadosR5.map((_, i) =>
          i === 0 ? '#ffcc50' : i === 1 ? '#ff9800' : i === 2 ? '#2f2c79' : '#94a3b8'
        ),
        borderRadius: 8,
      },
    ],
  };

  const chartR5Options: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { min: 0, max: 4, grid: { color: '#f1f5f9' } },
      x: { grid: { display: false } },
    },
  };

  if (loadingBase) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
        <div className="text-sm font-semibold text-slate-500">
          Carregando relatórios...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="sticky top-28 z-40 bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-slate-200 shadow-md flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            onClick={() => scrollToSection('relatorio-1')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2f2c79] hover:text-white transition font-medium cursor-pointer"
          >
            #1 Consolidado
          </button>
          <button
            onClick={() => scrollToSection('relatorio-2')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2f2c79] hover:text-white transition font-medium cursor-pointer"
          >
            #2 Radar
          </button>
          <button
            onClick={() => scrollToSection('relatorio-3')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2f2c79] hover:text-white transition font-medium cursor-pointer"
          >
            #3 Evolução
          </button>
          <button
            onClick={() => scrollToSection('relatorio-4')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#2f2c79] hover:text-white transition font-medium cursor-pointer"
          >
            #4 Pendências
          </button>
          <button
            onClick={() => scrollToSection('relatorio-5')}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-[#ff9800] hover:text-[#000020] transition font-bold cursor-pointer"
          >
            #5 Ranking
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-extrabold text-[#171a4a]">
              Relatórios
            </h2>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="font-semibold text-slate-600">Ciclo:</span>
            <select
              value={avaliacaoId}
              onChange={(e) => setAvaliacaoId(Number(e.target.value))}
              className="p-2 rounded-xl border border-slate-300 font-bold text-[#171a4a] bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
            >
              {avaliacoes.map((a) => (
                <option key={a.idAvaliacao} value={a.idAvaliacao}>
                  {a.titulo}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-[#2f2c79] flex items-center space-x-1">
            <Users size={14} />
            <span>Colaborador (Radar e Evolução):</span>
          </span>
          <select
            value={avaliadoId}
            onChange={(e) => setAvaliadoId(Number(e.target.value))}
            className="p-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 bg-white"
          >
            {usuarios.map((u) => (
              <option key={u.idUsuario} value={u.idUsuario}>
                {u.nome} - {u.cargo} ({u.departamento})
              </option>
            ))}
          </select>
        </div>
      </div>

      <section
        id="relatorio-1"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-48"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#000020]"
                style={{ backgroundColor: '#ffcc50' }}
              >
                Relatório 1
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171a4a] flex items-center space-x-2">
              <BarChart3 size={20} className="text-[#2f2c79]" />
              <span>Resultado Consolidado por Avaliado</span>
            </h3>
          </div>

          <div className="flex items-center space-x-3 text-xs self-start md:self-auto">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Filter size={13} className="text-slate-400" />
              <span>Mín. Avaliadores:</span>
              <input
                type="number"
                min="1"
                max="10"
                value={minAvaliadores}
                onChange={(e) => setMinAvaliadores(parseInt(e.target.value) || 1)}
                className="w-12 text-center p-1 rounded border border-slate-300 font-bold text-[#171a4a]"
              />
            </div>

            <button
              onClick={() => toggleSql('r1')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Code2 size={14} />
              <span>SQL</span>
              {showSql['r1'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showSql['r1'] && (
          <div className="bg-[#000020] text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <pre>{`SELECT u.id_usuario, u.nome, u.cargo, u.departamento,
  ROUND(SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2) AS media_ponderada,
  COUNT(DISTINCT d.id_avaliador) AS total_avaliadores,
  COUNT(r.id_resposta) AS total_respostas_computadas
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN USUARIO u ON u.id_usuario = d.id_avaliado
WHERE d.id_avaliacao = ${avaliacaoId} AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
HAVING COUNT(DISTINCT d.id_avaliador) >= ${minAvaliadores}
ORDER BY media_ponderada DESC;`}</pre>
          </div>
        )}

        {loadingR1 ? (
          <div className="text-center py-10 text-xs text-slate-400">Carregando consolidado...</div>
        ) : erroRelatorios.r1 ? (
          <div role="alert" className="text-center py-8 text-sm text-rose-700 bg-rose-50 rounded-xl">{erroRelatorios.r1}</div>
        ) : dadosR1.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma resposta computada para este ciclo com o corte mínimo de {minAvaliadores} avaliadores.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex-1 relative">
                <Bar data={chartR1Data} options={chartR1Options} />
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a4a] text-white sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5">Colaborador</th>
                    <th className="p-2.5">Departamento</th>
                    <th className="p-2.5 text-center">Avaliadores</th>
                    <th className="p-2.5 text-right">Média AvaliaMAX</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosR1.map((item, idx) => (
                    <tr key={item.id_usuario} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-semibold text-[#171a4a]">
                        <span className="text-slate-400 mr-1.5 font-mono">#{idx + 1}</span>
                        {item.nome}
                        <div className="text-[10px] text-slate-400 font-normal">{item.cargo}</div>
                      </td>
                      <td className="p-2.5 text-slate-600">{item.departamento}</td>
                      <td className="p-2.5 text-center font-semibold text-[#2f2c79]">
                        {item.total_avaliadores}
                      </td>
                      <td className="p-2.5 text-right font-black text-sm text-[#ff9800]">
                        {Number(item.media_ponderada).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section
        id="relatorio-2"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-48"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#000020]"
                style={{ backgroundColor: '#ffcc50' }}
              >
                Relatório 2
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171a4a] flex items-center space-x-2">
              <RadarIcon size={20} className="text-[#ff9800]" />
              <span>Radar de Competências</span>
            </h3>
          </div>

          <div className="flex items-center space-x-2 text-xs self-start md:self-auto">
            <button
              onClick={() => toggleSql('r2')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Code2 size={14} />
              <span>SQL</span>
              {showSql['r2'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showSql['r2'] && (
          <div className="bg-[#000020] text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <pre>{`SELECT q.id_questao, q.enunciado AS competencia, c.peso,
  ROUND(AVG(CAST(r.valor_resposta AS NUMERIC)), 2) AS media_avaliado,
  (
    -- Subconsulta correlacionada: média corporativa de todos os participantes para a mesma questão
    SELECT ROUND(AVG(CAST(r2.valor_resposta AS NUMERIC)), 2)
    FROM RESPOSTA r2
    JOIN DESIGNACAO d2 ON r2.id_designacao = d2.id_designacao
    WHERE d2.id_avaliacao = d.id_avaliacao AND r2.id_questao = q.id_questao
  ) AS media_geral_empresa,
  COUNT(r.id_resposta) AS total_avaliacoes_recebidas
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
WHERE d.id_avaliacao = ${avaliacaoId} AND d.id_avaliado = ${avaliadoId} AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
GROUP BY q.id_questao, q.enunciado, c.peso, d.id_avaliacao
ORDER BY q.id_questao;`}</pre>
          </div>
        )}

        {loadingR2 ? (
          <div className="text-center py-10 text-xs text-slate-400">Carregando radar...</div>
        ) : erroRelatorios.r2 ? (
          <div role="alert" className="text-center py-8 text-sm text-rose-700 bg-rose-50 rounded-xl">{erroRelatorios.r2}</div>
        ) : dadosR2.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma resposta encontrada para o colaborador selecionado neste ciclo.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-80 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex-1 relative">
                <Radar data={chartR2Data} options={chartR2Options} />
              </div>
            </div>

            <div className="overflow-x-auto max-h-80 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a4a] text-white sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5">Competência</th>
                    <th className="p-2.5 text-center">Peso</th>
                    <th className="p-2.5 text-right text-[#ffcc50]">Nota Avaliado</th>
                    <th className="p-2.5 text-right text-indigo-200">Média Empresa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosR2.map((item) => {
                    const diff = item.media_avaliado - item.media_geral_empresa;
                    const diffPositiva = diff >= 0;

                    return (
                      <tr key={item.id_questao} className="hover:bg-slate-50 transition">
                        <td className="p-2.5 font-semibold text-[#171a4a]">
                          {item.competencia}
                        </td>
                        <td className="p-2.5 text-center font-mono text-slate-500">
                          {Number(item.peso).toFixed(1)}
                        </td>
                        <td className="p-2.5 text-right font-black text-[#ff9800]">
                          {Number(item.media_avaliado).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-right">
                          <span className="font-semibold text-slate-600">
                            {Number(item.media_geral_empresa).toFixed(2)}
                          </span>
                          <span
                            className={`ml-1 text-[10px] font-bold ${
                              diffPositiva ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            ({diffPositiva ? '+' : ''}
                            {diff.toFixed(2)})
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section
        id="relatorio-3"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-48"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#000020]"
                style={{ backgroundColor: '#ffcc50' }}
              >
                Relatório 3
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171a4a] flex items-center space-x-2">
              <TrendingUp size={20} className="text-[#2f2c79]" />
              <span>Evolução entre Ciclos</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs self-start md:self-auto">
            <div className="flex items-center space-x-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <Calendar size={13} className="text-slate-400" />
              <input
                type="date"
                value={dataInicioEvolucao}
                onChange={(e) => setDataInicioEvolucao(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none"
              />
              <span>até</span>
              <input
                type="date"
                value={dataFimEvolucao}
                onChange={(e) => setDataFimEvolucao(e.target.value)}
                className="bg-transparent font-medium text-slate-700 focus:outline-none"
              />
            </div>

            <button
              onClick={() => toggleSql('r3')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Code2 size={14} />
              <span>SQL</span>
              {showSql['r3'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showSql['r3'] && (
          <div className="bg-[#000020] text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <pre>{`SELECT a.id_avaliacao, a.titulo AS ciclo, a.data_inicio, a.data_fim,
  ROUND(SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2) AS media_ponderada,
  COUNT(DISTINCT d.id_avaliador) AS total_avaliadores
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN AVALIACAO a ON a.id_avaliacao = d.id_avaliacao
WHERE d.id_avaliado = ${avaliadoId} AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
  AND a.data_inicio >= '${dataInicioEvolucao}' AND a.data_fim <= '${dataFimEvolucao}'
GROUP BY a.id_avaliacao, a.titulo, a.data_inicio, a.data_fim
ORDER BY a.data_inicio ASC;`}</pre>
          </div>
        )}

        {loadingR3 ? (
          <div className="text-center py-10 text-xs text-slate-400">Carregando evolução histórica...</div>
        ) : erroRelatorios.r3 ? (
          <div role="alert" className="text-center py-8 text-sm text-rose-700 bg-rose-50 rounded-xl">{erroRelatorios.r3}</div>
        ) : dadosR3.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhuma avaliação encontrada para o colaborador nesta faixa temporal.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex-1 relative">
                <Line data={chartR3Data} options={chartR3Options} />
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a4a] text-white sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5">Ciclo de Avaliação</th>
                    <th className="p-2.5">Período</th>
                    <th className="p-2.5 text-center">Avaliadores</th>
                    <th className="p-2.5 text-right">Nota Semestral</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosR3.map((item) => (
                    <tr key={item.id_avaliacao} className="hover:bg-slate-50 transition">
                      <td className="p-2.5 font-semibold text-[#171a4a]">{item.ciclo}</td>
                      <td className="p-2.5 text-slate-500 font-mono text-[11px]">
                        {item.data_inicio} a {item.data_fim}
                      </td>
                      <td className="p-2.5 text-center font-bold text-[#2f2c79]">
                        {item.total_avaliadores}
                      </td>
                      <td className="p-2.5 text-right font-black text-sm text-[#ff9800]">
                        {Number(item.media_ponderada).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      <section
        id="relatorio-4"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-48"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#000020]"
                style={{ backgroundColor: '#ffcc50' }}
              >
                Relatório 4
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171a4a] flex items-center space-x-2">
              <AlertTriangle size={20} className="text-[#ff9800]" />
              <span>Pendências de Resposta</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs self-start md:self-auto">
            <Filter size={13} className="text-slate-400" />
            {departamentosDisponiveis.map((dep) => {
              const ativo = departamentosPendencias.includes(dep);
              return (
                <button
                  key={dep}
                  onClick={() => toggleDepartamentoPendencias(dep)}
                  className={`px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    ativo
                      ? 'bg-[#2f2c79] text-white border-[#2f2c79] font-semibold'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {dep}
                </button>
              );
            })}
            <button
              onClick={() => toggleSql('r4')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Code2 size={14} />
              <span>SQL</span>
              {showSql['r4'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showSql['r4'] && (
          <div className="bg-[#000020] text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <pre>{`SELECT d.id_designacao, a.titulo AS avaliacao,
  u_avaliador.id_usuario AS id_avaliador, u_avaliador.nome AS avaliador_nome,
  u_avaliador.email AS avaliador_email, u_avaliador.departamento AS avaliador_departamento,
  u_avaliado.id_usuario AS id_avaliado, u_avaliado.nome AS avaliado_nome,
  u_avaliado.cargo AS avaliado_cargo, u_avaliado.departamento AS avaliado_departamento
FROM DESIGNACAO d
JOIN AVALIACAO a ON d.id_avaliacao = a.id_avaliacao
JOIN USUARIO u_avaliador ON d.id_avaliador = u_avaliador.id_usuario
JOIN USUARIO u_avaliado ON d.id_avaliado = u_avaliado.id_usuario
LEFT JOIN RESPOSTA r ON d.id_designacao = r.id_designacao
WHERE d.id_avaliacao = ${avaliacaoId}${
  departamentosPendencias.length > 0
    ? `\n  AND u_avaliador.departamento IN (${departamentosPendencias.map((d) => `'${d}'`).join(', ')})`
    : ''
}
GROUP BY d.id_designacao, a.titulo, u_avaliador.id_usuario, u_avaliador.nome,
  u_avaliador.email, u_avaliador.departamento, u_avaliado.id_usuario,
  u_avaliado.nome, u_avaliado.cargo, u_avaliado.departamento
HAVING COUNT(r.id_resposta) = 0
ORDER BY u_avaliador.nome ASC, u_avaliado.nome ASC;`}</pre>
          </div>
        )}

        {loadingR4 ? (
          <div className="text-center py-10 text-xs text-slate-400">Carregando pendências...</div>
        ) : erroRelatorios.r4 ? (
          <div role="alert" className="text-center py-8 text-sm text-rose-700 bg-rose-50 rounded-xl">{erroRelatorios.r4}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
            <div className="h-64 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
              <div className="w-44 h-44 relative">
                <Doughnut data={chartR4Data} options={chartR4Options} />
              </div>
            </div>

            <div className="lg:col-span-2 overflow-x-auto max-h-64 overflow-y-auto border border-slate-200 rounded-xl">
              {dadosR4.length === 0 ? (
                <div className="p-8 text-center text-xs text-emerald-700 bg-emerald-50">
                  <CheckCircle2 size={24} className="mx-auto mb-1 text-emerald-600" />
                  <strong>Nenhuma pendência encontrada.</strong>
                </div>
              ) : (
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#171a4a] text-white sticky top-0 font-bold">
                    <tr>
                      <th className="p-2.5">Avaliador</th>
                      <th className="p-2.5">Departamento</th>
                      <th className="p-2.5">Deveria Avaliar</th>
                      <th className="p-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {dadosR4.map((item) => (
                      <tr key={item.id_designacao} className="hover:bg-amber-50/30 transition">
                        <td className="p-2.5 font-bold text-[#171a4a]">
                          {item.avaliador_nome}
                          <div className="text-[10px] text-slate-400 font-normal">{item.avaliador_email}</div>
                        </td>
                        <td className="p-2.5 text-slate-600">{item.avaliador_departamento}</td>
                        <td className="p-2.5 font-medium text-slate-700">
                          {item.avaliado_nome}
                          <div className="text-[10px] text-slate-400 font-normal">{item.avaliado_cargo}</div>
                        </td>
                        <td className="p-2.5 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
                            Não Respondeu
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}
      </section>

      <section
        id="relatorio-5"
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5 scroll-mt-48"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold text-[#000020]"
                style={{ backgroundColor: '#ffcc50' }}
              >
                Relatório 5
              </span>
            </div>
            <h3 className="text-lg font-extrabold text-[#171a4a] flex items-center space-x-2">
              <Award size={20} className="text-[#ff9800]" />
              <span>Ranking de Desempenho</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs self-start md:self-auto">
            <input
              type="text"
              placeholder="Filtrar departamento..."
              value={departamentoRanking}
              onChange={(e) => setDepartamentoRanking(e.target.value)}
              className="p-1.5 rounded-xl border border-slate-300 text-xs w-44 focus:outline-none focus:ring-1 focus:ring-[#ff9800]"
            />

            <div className="flex items-center space-x-1 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Limite:</span>
              <select
                value={limiteRanking}
                onChange={(e) => setLimiteRanking(Number(e.target.value))}
                className="bg-transparent font-bold text-[#171a4a] focus:outline-none"
              >
                <option value={5}>Top 5</option>
                <option value={10}>Top 10</option>
                <option value={20}>Top 20</option>
              </select>
            </div>

            <button
              onClick={() => toggleSql('r5')}
              className="flex items-center space-x-1 px-3 py-1.5 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
            >
              <Code2 size={14} />
              <span>SQL</span>
              {showSql['r5'] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          </div>
        </div>

        {showSql['r5'] && (
          <div className="bg-[#000020] text-amber-200 p-4 rounded-xl text-xs font-mono overflow-x-auto">
            <pre>{`SELECT
  RANK() OVER (
    ORDER BY ROUND(SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2) DESC
  ) AS posicao_ranking,
  u.id_usuario, u.nome, u.cargo, u.departamento,
  ROUND(SUM(CAST(r.valor_resposta AS NUMERIC) * c.peso) / SUM(c.peso), 2) AS media_ponderada,
  COUNT(DISTINCT d.id_avaliador) AS total_avaliadores
FROM RESPOSTA r
JOIN DESIGNACAO d ON r.id_designacao = d.id_designacao
JOIN COMPOSICAO c ON c.id_avaliacao = d.id_avaliacao AND c.id_questao = r.id_questao
JOIN QUESTAO q ON q.id_questao = r.id_questao
JOIN USUARIO u ON u.id_usuario = d.id_avaliado
WHERE d.id_avaliacao = ${avaliacaoId} AND q.tipo_questao = 'MULTIPLA_ESCOLHA'
  ${departamentoRanking ? `AND u.departamento ILIKE '%${departamentoRanking}%'` : ''}
GROUP BY u.id_usuario, u.nome, u.cargo, u.departamento
HAVING COUNT(DISTINCT d.id_avaliador) >= 1
ORDER BY posicao_ranking ASC
FETCH FIRST ${limiteRanking} ROWS ONLY;`}</pre>
          </div>
        )}

        {loadingR5 ? (
          <div className="text-center py-10 text-xs text-slate-400">Carregando ranking...</div>
        ) : erroRelatorios.r5 ? (
          <div role="alert" className="text-center py-8 text-sm text-rose-700 bg-rose-50 rounded-xl">{erroRelatorios.r5}</div>
        ) : dadosR5.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Nenhum colaborador ranqueado com os filtros especificados.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
            <div className="h-72 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col justify-center">
              <div className="flex-1 relative">
                <Bar data={chartR5Data} options={chartR5Options} />
              </div>
            </div>

            <div className="overflow-x-auto max-h-72 overflow-y-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#171a4a] text-white sticky top-0 font-bold">
                  <tr>
                    <th className="p-2.5 text-center">Posição</th>
                    <th className="p-2.5">Colaborador</th>
                    <th className="p-2.5">Departamento</th>
                    <th className="p-2.5 text-right">Média Final</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {dadosR5.map((item) => {
                    const pos = item.posicao_ranking;
                    const podioIcon =
                      pos === 1 ? '🥇' : pos === 2 ? '🥈' : pos === 3 ? '🥉' : `#${pos}`;

                    return (
                      <tr
                        key={item.id_usuario}
                        className={`transition ${
                          pos <= 3 ? 'bg-amber-50/30 font-semibold' : 'hover:bg-slate-50'
                        }`}
                      >
                        <td className="p-2.5 text-center font-bold text-base">
                          {podioIcon}
                        </td>
                        <td className="p-2.5 font-bold text-[#171a4a]">
                          {item.nome}
                          <div className="text-[10px] text-slate-400 font-normal">{item.cargo}</div>
                        </td>
                        <td className="p-2.5 text-slate-600">{item.departamento}</td>
                        <td className="p-2.5 text-right font-black text-sm text-[#ff9800]">
                          {Number(item.media_ponderada).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
