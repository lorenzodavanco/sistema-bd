import React, { useEffect, useState } from 'react';
import {
  Calendar,
  Plus,
  Trash2,
  Edit2,
  Sliders,
  CheckCircle,
  AlertCircle,
  X,
  Layers,
  Check,
} from 'lucide-react';
import type { Avaliacao, Questao } from '../types';
import { api } from '../services/api';

export const AvaliacoesManager: React.FC = () => {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [todasQuestoes, setTodasQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const [modalAvaliacaoAberto, setModalAvaliacaoAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [salvandoAvaliacao, setSalvandoAvaliacao] = useState(false);

  const [composicaoModalAberta, setComposicaoModalAberta] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState<Avaliacao | null>(null);
  const [composicaoAtual, setComposicaoAtual] = useState<Map<number, number>>(new Map()); // idQuestao -> peso
  const [carregandoComposicao, setCarregandoComposicao] = useState(false);
  const [salvandoComposicao, setSalvandoComposicao] = useState(false);

  const [contagemQuestoes, setContagemQuestoes] = useState<{ [id: number]: number }>({});

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    setLoading(true);
    try {
      const [listaAvaliacoes, listaQuestoes] = await Promise.all([
        api.avaliacoes.listar(),
        api.questoes.listar(),
      ]);
      setAvaliacoes(listaAvaliacoes);
      setTodasQuestoes(listaQuestoes);

      const contagens: { [id: number]: number } = {};
      await Promise.all(
        listaAvaliacoes.map(async (av) => {
          try {
            const comps = await api.avaliacoes.listarQuestoes(av.idAvaliacao);
            contagens[av.idAvaliacao] = comps.length;
          } catch {
            contagens[av.idAvaliacao] = 0;
          }
        })
      );
      setContagemQuestoes(contagens);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar dados de avaliações' });
    } finally {
      setLoading(false);
    }
  };

  const abrirModalCriar = () => {
    setEditandoId(null);
    setTitulo('');
    setDescricao('');
    const hoje = new Date().toISOString().split('T')[0];
    setDataInicio(hoje);
    const daqui3Meses = new Date();
    daqui3Meses.setMonth(daqui3Meses.getMonth() + 3);
    setDataFim(daqui3Meses.toISOString().split('T')[0]);
    setModalAvaliacaoAberto(true);
  };

  const abrirModalEditar = (av: Avaliacao) => {
    setEditandoId(av.idAvaliacao);
    setTitulo(av.titulo);
    setDescricao(av.descricao || '');
    setDataInicio(av.dataInicio);
    setDataFim(av.dataFim);
    setModalAvaliacaoAberto(true);
  };

  const handleSalvarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !dataInicio || !dataFim) {
      setFeedback({ tipo: 'erro', texto: 'Título, data de início e data de fim são obrigatórios.' });
      return;
    }

    if (dataInicio > dataFim) {
      setFeedback({ tipo: 'erro', texto: 'A data de início não pode ser posterior à data de fim.' });
      return;
    }

    setSalvandoAvaliacao(true);
    try {
      const payload = {
        titulo: titulo.trim(),
        descricao: descricao.trim() || undefined,
        dataInicio,
        dataFim,
      };

      if (editandoId) {
        await api.avaliacoes.atualizar(editandoId, payload);
        setFeedback({ tipo: 'sucesso', texto: 'Ciclo de avaliação atualizado com sucesso!' });
      } else {
        await api.avaliacoes.criar(payload);
        setFeedback({ tipo: 'sucesso', texto: 'Novo ciclo cadastrado com sucesso!' });
      }

      setModalAvaliacaoAberto(false);
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao salvar avaliação' });
    } finally {
      setSalvandoAvaliacao(false);
    }
  };

  const handleExcluirAvaliacao = async (id: number, tituloAv: string) => {
    if (
      !window.confirm(
        `Tem certeza que deseja excluir o ciclo "${tituloAv}"? Todas as suas composições, designações e respostas serão removidas em cascata.`
      )
    ) {
      return;
    }

    try {
      await api.avaliacoes.remover(id);
      setFeedback({ tipo: 'sucesso', texto: 'Ciclo removido com sucesso!' });
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao excluir ciclo' });
    }
  };

  const abrirModalComposicao = async (av: Avaliacao) => {
    setAvaliacaoSelecionada(av);
    setCarregandoComposicao(true);
    setComposicaoModalAberta(true);

    try {
      const comps = await api.avaliacoes.listarQuestoes(av.idAvaliacao);
      const mapPesos = new Map<number, number>();
      comps.forEach((c: any) => {
        mapPesos.set(c.idQuestao, Number(c.peso) || 1.0);
      });
      setComposicaoAtual(mapPesos);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar composição da avaliação' });
    } finally {
      setCarregandoComposicao(false);
    }
  };

  const toggleQuestaoNaComposicao = (idQuestao: number) => {
    setComposicaoAtual((prev) => {
      const novo = new Map(prev);
      if (novo.has(idQuestao)) {
        novo.delete(idQuestao);
      } else {
        novo.set(idQuestao, 1.0); // Peso padrão 1.0
      }
      return novo;
    });
  };

  const alterarPesoQuestao = (idQuestao: number, novoPeso: number) => {
    if (novoPeso <= 0) return;
    setComposicaoAtual((prev) => {
      const novo = new Map(prev);
      novo.set(idQuestao, Math.round(novoPeso * 100) / 100);
      return novo;
    });
  };

  const handleSalvarComposicao = async () => {
    if (!avaliacaoSelecionada) return;

    if (composicaoAtual.size === 0) {
      if (!window.confirm('Deseja deixar a avaliação sem nenhuma questão associada?')) {
        return;
      }
    }

    setSalvandoComposicao(true);
    try {
      // Texto livre não entra na média ponderada: grava sempre peso 1.00
      const listaPayload = Array.from(composicaoAtual.entries()).map(([idQuestao, peso]) => ({
        idQuestao,
        peso: ehTextoLivre(idQuestao) ? 1.0 : peso,
      }));

      await api.avaliacoes.salvarComposicao(avaliacaoSelecionada.idAvaliacao, listaPayload);
      setFeedback({
        tipo: 'sucesso',
        texto: `Composição e pesos da avaliação "${avaliacaoSelecionada.titulo}" atualizados com sucesso!`,
      });

      setComposicaoModalAberta(false);
      await carregarDados();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao salvar composição de pesos' });
    } finally {
      setSalvandoComposicao(false);
    }
  };

  const ehTextoLivre = (idQuestao: number) =>
    todasQuestoes.find((q) => q.idQuestao === idQuestao)?.tipoQuestao === 'TEXTO_LIVRE';

  const somaTotalPesos = Array.from(composicaoAtual.entries())
    .filter(([idQuestao]) => !ehTextoLivre(idQuestao))
    .reduce((acc, [, p]) => acc + p, 0);

  const getStatusCiclo = (inicio: string, fim: string) => {
    const hoje = new Date().toISOString().split('T')[0];
    if (hoje < inicio) {
      return { rotulo: 'Em Breve', classe: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (hoje > fim) {
      return { rotulo: 'Encerrado', classe: 'bg-slate-200 text-slate-700 border-slate-300' };
    }
    return { rotulo: 'Ciclo Ativo', classe: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold">
              Total: {avaliacoes.length} ciclos
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#171a4a] mt-1">
            Ciclos de Avaliação & Composição Ponderada
          </h2>
        </div>

        <button
          onClick={abrirModalCriar}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#000020] shadow transition hover:opacity-95 cursor-pointer self-start sm:self-auto"
          style={{ backgroundColor: '#ff9800' }}
        >
          <Plus size={18} />
          <span>Novo Ciclo de Avaliação</span>
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
            {feedback.tipo === 'sucesso' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Carregando ciclos de avaliação...</div>
      ) : avaliacoes.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Nenhum ciclo de avaliação cadastrado. Clique no botão acima para criar o primeiro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {avaliacoes.map((av) => {
            const status = getStatusCiclo(av.dataInicio, av.dataFim);
            const totalQuestoes = contagemQuestoes[av.idAvaliacao] ?? 0;

            return (
              <div
                key={av.idAvaliacao}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.classe}`}
                    >
                      {status.rotulo}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => abrirModalEditar(av)}
                        title="Editar Informações"
                        className="p-1 text-slate-400 hover:text-[#2f2c79] transition cursor-pointer"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => handleExcluirAvaliacao(av.idAvaliacao, av.titulo)}
                        title="Excluir Ciclo"
                        className="p-1 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-extrabold text-[#171a4a] mb-1">
                    {av.titulo}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4">
                    {av.descricao || 'Sem descrição cadastrada.'}
                  </p>

                  <div className="flex items-center space-x-4 text-xs text-slate-600 mb-4">
                    <div className="flex items-center space-x-1.5">
                      <Calendar size={14} className="text-slate-400" />
                      <span>
                        {av.dataInicio} até {av.dataFim}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1.5 font-semibold text-[#2f2c79]">
                      <Layers size={14} />
                      <span>{totalQuestoes} questões vinculadas</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID #{av.idAvaliacao}
                  </span>

                  <button
                    onClick={() => abrirModalComposicao(av)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs transition hover:opacity-95 cursor-pointer"
                    style={{ backgroundColor: '#2f2c79' }}
                  >
                    <Sliders size={14} style={{ color: '#ffcc50' }} />
                    <span>Montar Composição & Pesos</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalAvaliacaoAberto && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200">
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div className="flex items-center space-x-2">
                <Calendar size={20} style={{ color: '#ffcc50' }} />
                <h3 className="font-bold text-base">
                  {editandoId ? `Editar Avaliação #${editandoId}` : 'Novo Ciclo de Avaliação'}
                </h3>
              </div>
              <button
                onClick={() => setModalAvaliacaoAberto(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarAvaliacao} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Título do Ciclo *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Avaliação de Desempenho AvaliaMAX - 2026.1"
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Descrição / Objetivo
                </label>
                <textarea
                  rows={2}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Ex: Avaliação semestral de competências técnicas, liderança e entregas."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Data de Início *
                  </label>
                  <input
                    type="date"
                    value={dataInicio}
                    onChange={(e) => setDataInicio(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Data de Fim *
                  </label>
                  <input
                    type="date"
                    value={dataFim}
                    onChange={(e) => setDataFim(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalAvaliacaoAberto(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvandoAvaliacao}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#ff9800' }}
                >
                  {salvandoAvaliacao ? 'Salvando...' : editandoId ? 'Atualizar Ciclo' : 'Cadastrar Ciclo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {composicaoModalAberta && avaliacaoSelecionada && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl shrink-0"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <Sliders size={20} style={{ color: '#ffcc50' }} />
                  <h3 className="font-bold text-base">
                    Composição & Pesos
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Ciclo: <span className="text-[#ffcc50] font-semibold">{avaliacaoSelecionada.titulo}</span>
                </p>
              </div>

              <button
                onClick={() => setComposicaoModalAberta(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center space-x-4 text-xs">
                <div>
                  <span className="text-slate-500">Questões Vinculadas:</span>{' '}
                  <span className="font-bold text-[#2f2c79]">{composicaoAtual.size} de {todasQuestoes.length}</span>
                </div>
                <div>
                  <span className="text-slate-500">Soma Total dos Pesos:</span>{' '}
                  <span className="font-bold text-[#ff9800] text-sm">{somaTotalPesos.toFixed(2)}</span>
                </div>
              </div>

            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {carregandoComposicao ? (
                <div className="text-center py-12 text-sm text-slate-500">
                  Carregando critérios e pesos da avaliação...
                </div>
              ) : todasQuestoes.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-500">
                  Nenhuma questão disponível no banco. Cadastre questões no módulo de Questões.
                </div>
              ) : (
                todasQuestoes.map((q) => {
                  const isChecked = composicaoAtual.has(q.idQuestao);
                  const pesoAtual = composicaoAtual.get(q.idQuestao) || 1.0;
                  const percentual =
                    somaTotalPesos > 0 && isChecked
                      ? ((pesoAtual / somaTotalPesos) * 100).toFixed(1)
                      : null;

                  return (
                    <div
                      key={q.idQuestao}
                      className={`p-3.5 rounded-xl border transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isChecked
                          ? 'border-[#ff9800]/60 bg-amber-50/20 shadow-xs'
                          : 'border-slate-200 bg-white opacity-85 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-start space-x-3 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleQuestaoNaComposicao(q.idQuestao)}
                          className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition cursor-pointer ${
                            isChecked
                              ? 'text-white'
                              : 'border border-slate-300 hover:border-slate-400 bg-white'
                          }`}
                          style={{
                            backgroundColor: isChecked ? '#ff9800' : 'transparent',
                          }}
                        >
                          {isChecked && <Check size={16} strokeWidth={3} className="text-[#000020]" />}
                        </button>

                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="text-[11px] font-bold text-slate-400 font-mono">
                              #{q.idQuestao}
                            </span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                                q.tipoQuestao === 'MULTIPLA_ESCOLHA'
                                  ? 'bg-[#2f2c79]/10 text-[#2f2c79]'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {q.tipoQuestao === 'MULTIPLA_ESCOLHA' ? 'MÚLTIPLA ESCOLHA' : 'TEXTO LIVRE'}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-[#171a4a] leading-tight">
                            {q.enunciado}
                          </p>
                        </div>
                      </div>

                      {isChecked && q.tipoQuestao === 'MULTIPLA_ESCOLHA' && (
                        <div className="flex items-center space-x-3 self-end sm:self-center shrink-0 bg-white p-2 rounded-xl border border-slate-200">
                          <div className="text-right">
                            <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                              Peso
                            </span>
                            {percentual && (
                              <span className="text-[10px] font-bold text-[#ff9800]">
                                {percentual}% do total
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-1">
                            <button
                              type="button"
                              onClick={() => alterarPesoQuestao(q.idQuestao, pesoAtual - 0.5)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={pesoAtual}
                              onChange={(e) =>
                                alterarPesoQuestao(q.idQuestao, parseFloat(e.target.value) || 1.0)
                              }
                              className="w-14 text-center p-1 rounded border border-slate-200 text-xs font-bold text-[#171a4a]"
                            />
                            <button
                              type="button"
                              onClick={() => alterarPesoQuestao(q.idQuestao, pesoAtual + 0.5)}
                              className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl shrink-0">
              <span />

              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => setComposicaoModalAberta(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSalvarComposicao}
                  disabled={salvandoComposicao}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                  style={{ backgroundColor: '#ff9800' }}
                >
                  {salvandoComposicao ? 'Salvando Pesos...' : 'Salvar Composição e Pesos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
