import React, { useEffect, useState } from 'react';
import {
  UserCheck,
  Plus,
  Trash2,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Filter,
  ArrowRight,
} from 'lucide-react';
import type { Designacao, Avaliacao, Usuario } from '../types';
import { api } from '../services/api';

export const DesignacoesManager: React.FC = () => {
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Status de respostas por idDesignacao: true = respondida, false = pendente
  const [statusRespostas, setStatusRespostas] = useState<{ [id: number]: boolean }>({});

  const [filtroAvaliacao, setFiltroAvaliacao] = useState<string>('TODAS');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'RESPONDIDAS' | 'PENDENTES'>('TODOS');
  const [busca, setBusca] = useState('');

  const [modalAberto, setModalAberto] = useState(false);
  const [novaAvaliacaoId, setNovaAvaliacaoId] = useState<number | ''>('');
  const [novoAvaliadorId, setNovoAvaliadorId] = useState<number | ''>('');
  const [novoAvaliadoId, setNovoAvaliadoId] = useState<number | ''>('');
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [listaDesig, listaAv, listaUsr] = await Promise.all([
        api.designacoes.listar(),
        api.avaliacoes.listar(),
        api.usuarios.listar(),
      ]);

      setDesignacoes(listaDesig);
      setAvaliacoes(listaAv);
      setUsuarios(listaUsr);

      if (listaAv.length > 0 && novaAvaliacaoId === '') {
        setNovaAvaliacaoId(listaAv[0].idAvaliacao);
      }
      if (listaUsr.length >= 2 && novoAvaliadorId === '' && novoAvaliadoId === '') {
        setNovoAvaliadorId(listaUsr[0].idUsuario);
        setNovoAvaliadoId(listaUsr[1].idUsuario);
      }

      const statusMap: { [id: number]: boolean } = {};
      await Promise.all(
        listaDesig.map(async (d) => {
          try {
            const resp = await api.designacoes.listarRespostas(d.idDesignacao);
            statusMap[d.idDesignacao] = resp && resp.length > 0;
          } catch {
            statusMap[d.idDesignacao] = false;
          }
        })
      );
      setStatusRespostas(statusMap);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar designações' });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!novaAvaliacaoId || !novoAvaliadorId || !novoAvaliadoId) {
      setFeedback({ tipo: 'erro', texto: 'Selecione o ciclo de avaliação, avaliador e avaliado.' });
      return;
    }

    if (novoAvaliadorId === novoAvaliadoId) {
      if (!window.confirm('O avaliador e o avaliado são a mesma pessoa (Autoavaliação). Deseja continuar?')) {
        return;
      }
    }

    setSalvando(true);
    try {
      await api.designacoes.criar({
        idAvaliacao: Number(novaAvaliacaoId),
        idAvaliador: Number(novoAvaliadorId),
        idAvaliado: Number(novoAvaliadoId),
      });

      setFeedback({
        tipo: 'sucesso',
        texto: 'Designação criada com sucesso!',
      });

      setModalAberto(false);
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao salvar designação' });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (id: number) => {
    if (
      !window.confirm(
        'Tem certeza que deseja remover esta designação? Todas as respostas associadas serão apagadas.'
      )
    ) {
      return;
    }

    try {
      await api.designacoes.remover(id);
      setFeedback({ tipo: 'sucesso', texto: 'Designação removida com sucesso!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao remover designação' });
    }
  };

  const usuariosMap = new Map<number, Usuario>();
  usuarios.forEach((u) => usuariosMap.set(u.idUsuario, u));

  const avaliacoesMap = new Map<number, Avaliacao>();
  avaliacoes.forEach((a) => avaliacoesMap.set(a.idAvaliacao, a));

  const designacoesFiltradas = designacoes.filter((d) => {
    const matchAv =
      filtroAvaliacao === 'TODAS' || d.idAvaliacao.toString() === filtroAvaliacao;

    const isRespondida = !!statusRespostas[d.idDesignacao];
    const matchStatus =
      filtroStatus === 'TODOS' ||
      (filtroStatus === 'RESPONDIDAS' && isRespondida) ||
      (filtroStatus === 'PENDENTES' && !isRespondida);

    const avaliador = usuariosMap.get(d.idAvaliador);
    const avaliado = usuariosMap.get(d.idAvaliado);
    const av = avaliacoesMap.get(d.idAvaliacao);

    const termo = busca.toLowerCase();
    const matchBusca =
      !busca ||
      avaliador?.nome.toLowerCase().includes(termo) ||
      avaliado?.nome.toLowerCase().includes(termo) ||
      av?.titulo.toLowerCase().includes(termo) ||
      d.idDesignacao.toString() === busca.trim();

    return matchAv && matchStatus && matchBusca;
  });

  const totalRespondidas = Object.values(statusRespostas).filter(Boolean).length;
  const totalPendentes = designacoes.length - totalRespondidas;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold">
              Total: {designacoes.length} vínculos
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#171a4a] mt-1">
            Designações de Avaliadores & Avaliados
          </h2>
        </div>

        <button
          onClick={() => setModalAberto(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#000020] shadow transition hover:opacity-95 cursor-pointer self-start sm:self-auto"
          style={{ backgroundColor: '#ff9800' }}
        >
          <Plus size={18} />
          <span>Nova Designação</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`flex items-center justify-between p-4 rounded-xl text-xs font-semibold ${
            feedback.tipo === 'sucesso'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Total de Designações</span>
            <div className="text-xl font-black text-[#171a4a]">{designacoes.length}</div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
            style={{ backgroundColor: '#2f2c79' }}
          >
            <UserCheck size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Questionários Respondidos</span>
            <div className="text-xl font-black text-emerald-600">{totalRespondidas}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 size={20} />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium">Pendentes de Resposta</span>
            <div className="text-xl font-black text-[#ff9800]">{totalPendentes}</div>
          </div>
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[#000020]"
            style={{ backgroundColor: '#ffcc50' }}
          >
            <Clock size={20} />
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nome do avaliador, avaliado ou ciclo..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filtroAvaliacao}
              onChange={(e) => setFiltroAvaliacao(e.target.value)}
              className="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="TODAS">Todos os Ciclos</option>
              {avaliacoes.map((av) => (
                <option key={av.idAvaliacao} value={av.idAvaliacao.toString()}>
                  {av.titulo}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1 bg-white p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setFiltroStatus('TODOS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filtroStatus === 'TODOS' ? 'bg-[#2f2c79] text-white font-bold' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFiltroStatus('RESPONDIDAS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filtroStatus === 'RESPONDIDAS'
                  ? 'bg-emerald-600 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Respondidas
            </button>
            <button
              onClick={() => setFiltroStatus('PENDENTES')}
              className={`px-2.5 py-1 rounded-lg font-medium transition cursor-pointer ${
                filtroStatus === 'PENDENTES'
                  ? 'bg-[#ff9800] text-[#000020] font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pendentes
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Carregando designações...</div>
      ) : designacoesFiltradas.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Nenhuma designação encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-3">
          {designacoesFiltradas.map((d) => {
            const avaliador = usuariosMap.get(d.idAvaliador);
            const avaliado = usuariosMap.get(d.idAvaliado);
            const av = avaliacoesMap.get(d.idAvaliacao);
            const respondida = !!statusRespostas[d.idDesignacao];

            return (
              <div
                key={d.idDesignacao}
                className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400">
                      ID #{d.idDesignacao}
                    </span>
                    <span
                      className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: '#ffcc50', color: '#000020' }}
                    >
                      {av ? av.titulo : `Avaliação #${d.idAvaliacao}`}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center space-x-1 ${
                        respondida
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {respondida ? (
                        <>
                          <CheckCircle2 size={12} />
                          <span>Respondida</span>
                        </>
                      ) : (
                        <>
                          <Clock size={12} />
                          <span>Pendente</span>
                        </>
                      )}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-1">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs"
                        style={{ backgroundColor: '#2f2c79' }}
                      >
                        {avaliador ? avaliador.nome.substring(0, 2).toUpperCase() : 'AV'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#171a4a]">
                          {avaliador ? avaliador.nome : `Avaliador #${d.idAvaliador}`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {avaliador?.cargo} • <span className="text-[#2f2c79] font-medium">{avaliador?.departamento}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center text-slate-400 px-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider mr-1 text-[#ff9800]">
                        avalia
                      </span>
                      <ArrowRight size={16} className="text-[#ff9800]" />
                    </div>

                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[#000020] text-xs"
                        style={{ backgroundColor: '#ffcc50' }}
                      >
                        {avaliado ? avaliado.nome.substring(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#171a4a]">
                          {avaliado ? avaliado.nome : `Avaliado #${d.idAvaliado}`}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {avaliado?.cargo} • <span className="text-[#2f2c79] font-medium">{avaliado?.departamento}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end md:self-center shrink-0">
                  <button
                    onClick={() => handleExcluir(d.idDesignacao)}
                    title="Excluir Designação"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200">
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div className="flex items-center space-x-2">
                <UserCheck size={20} style={{ color: '#ffcc50' }} />
                <h3 className="font-bold text-base">Nova Designação AvaliaMAX</h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Ciclo de Avaliação *
                </label>
                <select
                  value={novaAvaliacaoId}
                  onChange={(e) => setNovaAvaliacaoId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                >
                  {avaliacoes.map((av) => (
                    <option key={av.idAvaliacao} value={av.idAvaliacao}>
                      {av.titulo} ({av.dataInicio} a {av.dataFim})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Avaliador (Quem irá preencher o questionário) *
                </label>
                <select
                  value={novoAvaliadorId}
                  onChange={(e) => setNovoAvaliadorId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                >
                  {usuarios.map((u) => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.nome} - {u.cargo} ({u.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Avaliado (Quem será avaliado) *
                </label>
                <select
                  value={novoAvaliadoId}
                  onChange={(e) => setNovoAvaliadoId(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                >
                  {usuarios.map((u) => (
                    <option key={u.idUsuario} value={u.idUsuario}>
                      {u.nome} - {u.cargo} ({u.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#ff9800' }}
                >
                  {salvando ? 'Salvando...' : 'Criar Designação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
