import React, { useEffect, useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit2,
  ListFilter,
  Search,
  CheckCircle,
  AlertCircle,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import type { Questao, Alternativa, TipoQuestao } from '../types';
import { api } from '../services/api';

export const QuestoesManager: React.FC = () => {
  const [questoes, setQuestoes] = useState<Questao[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('TODAS');
  const [busca, setBusca] = useState('');
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Alternativas abertas no accordion
  const [alternativasPorQuestao, setAlternativasPorQuestao] = useState<{
    [id: number]: Alternativa[];
  }>({});
  const [loadingAlternativas, setLoadingAlternativas] = useState<{ [id: number]: boolean }>({});
  const [openAccordion, setOpenAccordion] = useState<{ [id: number]: boolean }>({});

  // Estado do Modal (Criar / Editar)
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [enunciado, setEnunciado] = useState('');
  const [tipoQuestao, setTipoQuestao] = useState<TipoQuestao>('MULTIPLA_ESCOLHA');
  const [alternativasForm, setAlternativasForm] = useState<
    { idAlternativa: number; texto: string }[]
  >([
    { idAlternativa: 1, texto: 'Insatisfatório: Abaixo do padrão esperado.' },
    { idAlternativa: 2, texto: 'Regular: Atende parcialmente com acompanhamento.' },
    { idAlternativa: 3, texto: 'Bom: Desempenho sólido e consistente.' },
    { idAlternativa: 4, texto: 'Excelente: Supera amplamente o padrão estabelecido.' },
  ]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarQuestoes();
  }, []);

  const carregarQuestoes = async () => {
    setLoading(true);
    try {
      const data = await api.questoes.listar();
      setQuestoes(data);
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar questões' });
    } finally {
      setLoading(false);
    }
  };

  const toggleAccordion = async (idQuestao: number, tipo: TipoQuestao) => {
    if (tipo !== 'MULTIPLA_ESCOLHA') return;

    const novoEstado = !openAccordion[idQuestao];
    setOpenAccordion((prev) => ({ ...prev, [idQuestao]: novoEstado }));

    if (novoEstado && !alternativasPorQuestao[idQuestao]) {
      setLoadingAlternativas((prev) => ({ ...prev, [idQuestao]: true }));
      try {
        const alts = await api.questoes.listarAlternativas(idQuestao);
        setAlternativasPorQuestao((prev) => ({ ...prev, [idQuestao]: alts }));
      } catch (err: any) {
        setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar alternativas' });
      } finally {
        setLoadingAlternativas((prev) => ({ ...prev, [idQuestao]: false }));
      }
    }
  };

  const abrirModalCriar = () => {
    setEditandoId(null);
    setEnunciado('');
    setTipoQuestao('MULTIPLA_ESCOLHA');
    setAlternativasForm([
      { idAlternativa: 1, texto: 'Insatisfatório: Abaixo do padrão esperado.' },
      { idAlternativa: 2, texto: 'Regular: Atende parcialmente aos requisitos.' },
      { idAlternativa: 3, texto: 'Bom: Desempenho consistente e alinhado.' },
      { idAlternativa: 4, texto: 'Excelente: Supera amplamente as expectativas.' },
    ]);
    setModalAberto(true);
  };

  const abrirModalEditar = async (q: Questao) => {
    setEditandoId(q.idQuestao);
    setEnunciado(q.enunciado);
    setTipoQuestao(q.tipoQuestao);
    if (q.tipoQuestao === 'MULTIPLA_ESCOLHA') {
      try {
        const alts = await api.questoes.listarAlternativas(q.idQuestao);
        setAlternativasForm(alts.map((a) => ({ idAlternativa: a.idAlternativa, texto: a.texto })));
      } catch {
        setAlternativasForm([
          { idAlternativa: 1, texto: '' },
          { idAlternativa: 2, texto: '' },
        ]);
      }
    } else {
      setAlternativasForm([]);
    }
    setModalAberto(true);
  };

  const preencherEscalaPadrao = () => {
    setAlternativasForm([
      { idAlternativa: 1, texto: 'Insatisfatório: Abaixo do padrão esperado.' },
      { idAlternativa: 2, texto: 'Regular: Atende parcialmente aos requisitos.' },
      { idAlternativa: 3, texto: 'Bom: Desempenho consistente e alinhado.' },
      { idAlternativa: 4, texto: 'Excelente: Supera amplamente as expectativas.' },
    ]);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enunciado.trim()) {
      setFeedback({ tipo: 'erro', texto: 'Informe o enunciado da questão.' });
      return;
    }

    if (tipoQuestao === 'MULTIPLA_ESCOLHA') {
      const validas = alternativasForm.filter((a) => a.texto.trim().length > 0);
      if (validas.length < 2) {
        setFeedback({
          tipo: 'erro',
          texto: 'Questões de múltipla escolha necessitam de pelo menos 2 alternativas preenchidas.',
        });
        return;
      }
    }

    setSalvando(true);
    try {
      const payload = {
        enunciado: enunciado.trim(),
        tipoQuestao,
        alternativas:
          tipoQuestao === 'MULTIPLA_ESCOLHA'
            ? alternativasForm
                .filter((a) => a.texto.trim().length > 0)
                .map((a, idx) => ({ idAlternativa: idx + 1, texto: a.texto.trim() }))
            : undefined,
      };

      if (editandoId) {
        await api.questoes.atualizar(editandoId, payload);
        setFeedback({ tipo: 'sucesso', texto: 'Questão atualizada com sucesso!' });
      } else {
        await api.questoes.criar(payload);
        setFeedback({ tipo: 'sucesso', texto: 'Questão cadastrada com sucesso!' });
      }

      setModalAberto(false);
      // Limpa cache de alternativas para recarregar
      setAlternativasPorQuestao({});
      await carregarQuestoes();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Falha ao salvar questão' });
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (idQuestao: number) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir esta questão? Ela será removida das avaliações e respostas associadas.'
      )
    ) {
      return;
    }

    try {
      await api.questoes.remover(idQuestao);
      setFeedback({ tipo: 'sucesso', texto: 'Questão excluída com sucesso!' });
      await carregarQuestoes();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao excluir questão' });
    }
  };

  const questoesFiltradas = questoes.filter((q) => {
    const matchTipo = filtroTipo === 'TODAS' || q.tipoQuestao === filtroTipo;
    const matchBusca =
      !busca ||
      q.enunciado.toLowerCase().includes(busca.toLowerCase()) ||
      q.idQuestao.toString() === busca.trim();
    return matchTipo && matchBusca;
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-semibold">
              Total: {questoes.length} cadastradas
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#171a4a] mt-1">
            Gestão de Questões & Competências
          </h2>
        </div>

        <button
          onClick={abrirModalCriar}
          className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-[#000020] shadow transition hover:opacity-95 cursor-pointer self-start sm:self-auto"
          style={{ backgroundColor: '#ff9800' }}
        >
          <Plus size={18} />
          <span>Nova Questão</span>
        </button>
      </div>

      {/* Banner de Feedback */}
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

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por enunciado ou ID..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
          />
        </div>

        <div className="flex items-center space-x-2">
          <ListFilter size={18} className="text-slate-400 hidden sm:block" />
          <select
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
            className="px-3 py-2 bg-white rounded-xl border border-slate-200 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
          >
            <option value="TODAS">Todos os Tipos ({questoes.length})</option>
            <option value="MULTIPLA_ESCOLHA">
              Múltipla Escolha ({questoes.filter((q) => q.tipoQuestao === 'MULTIPLA_ESCOLHA').length})
            </option>
            <option value="TEXTO_LIVRE">
              Texto Livre ({questoes.filter((q) => q.tipoQuestao === 'TEXTO_LIVRE').length})
            </option>
          </select>
        </div>
      </div>

      {/* Lista de Questões */}
      {loading ? (
        <div className="text-center py-12 text-sm text-slate-500">Carregando questões do banco...</div>
      ) : questoesFiltradas.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-sm text-slate-500">
          Nenhuma questão encontrada com os filtros selecionados.
        </div>
      ) : (
        <div className="space-y-3">
          {questoesFiltradas.map((q) => {
            const isMultipla = q.tipoQuestao === 'MULTIPLA_ESCOLHA';
            const isOpen = openAccordion[q.idQuestao];
            const alts = alternativasPorQuestao[q.idQuestao] || [];

            return (
              <div
                key={q.idQuestao}
                className="bg-white rounded-xl border border-slate-200 shadow-sm transition hover:border-slate-300 overflow-hidden"
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1.5">
                      <span className="text-xs font-bold text-slate-400">#{q.idQuestao}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMultipla
                            ? 'bg-[#2f2c79]/10 text-[#2f2c79]'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isMultipla ? 'MÚLTIPLA ESCOLHA' : 'TEXTO LIVRE'}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-[#171a4a] leading-snug">
                      {q.enunciado}
                    </p>
                  </div>

                  {/* Ações */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {isMultipla && (
                      <button
                        onClick={() => toggleAccordion(q.idQuestao, q.tipoQuestao)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                      >
                        <span>Alternativas</span>
                        {isOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}

                    <button
                      onClick={() => abrirModalEditar(q)}
                      title="Editar Questão"
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#2f2c79] hover:bg-slate-100 transition cursor-pointer"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => handleExcluir(q.idQuestao)}
                      title="Excluir Questão"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Accordion de Alternativas */}
                {isMultipla && isOpen && (
                  <div className="bg-slate-50/80 px-5 py-3 border-t border-slate-100">
                    <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Alternativas
                    </h5>
                    {loadingAlternativas[q.idQuestao] ? (
                      <p className="text-xs text-slate-400">Carregando alternativas...</p>
                    ) : alts.length === 0 ? (
                      <p className="text-xs text-slate-400">Nenhuma alternativa cadastrada.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {alts.map((a) => (
                          <div
                            key={a.idAlternativa}
                            className="flex items-start space-x-2 text-xs bg-white p-2.5 rounded-lg border border-slate-200"
                          >
                            <span
                              className="font-bold px-1.5 py-0.5 rounded text-[10px] text-white shrink-0"
                              style={{ backgroundColor: '#2f2c79' }}
                            >
                              {a.idAlternativa}
                            </span>
                            <span className="text-slate-700">{a.texto}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Criação / Edição */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div className="flex items-center space-x-2">
                <HelpCircle size={20} style={{ color: '#ffcc50' }} />
                <h3 className="font-bold text-base">
                  {editandoId ? `Editar Questão #${editandoId}` : 'Nova Questão'}
                </h3>
              </div>
              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="p-6 space-y-4">
              {/* Enunciado */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Enunciado / Critério de Avaliação *
                </label>
                <textarea
                  rows={3}
                  value={enunciado}
                  onChange={(e) => setEnunciado(e.target.value)}
                  placeholder="Ex: Como você avalia a clareza e transparência na comunicação com a equipe?"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                  required
                />
              </div>

              {/* Tipo de Questão */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  Tipo de Questão *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoQuestao('MULTIPLA_ESCOLHA')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                      tipoQuestao === 'MULTIPLA_ESCOLHA'
                        ? 'border-[#ff9800] bg-[#ff9800]/10 text-[#000020]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Múltipla Escolha</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Escala com alternativas (1 a 4)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTipoQuestao('TEXTO_LIVRE')}
                    className={`p-3 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center cursor-pointer ${
                      tipoQuestao === 'TEXTO_LIVRE'
                        ? 'border-[#ff9800] bg-[#ff9800]/10 text-[#000020]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span>Texto Livre</span>
                    <span className="text-[10px] font-normal text-slate-500 mt-0.5">
                      Comentários e feedbacks abertos
                    </span>
                  </button>
                </div>
              </div>

              {/* Se Múltipla Escolha: Alternativas */}
              {tipoQuestao === 'MULTIPLA_ESCOLHA' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
                      Alternativas (Mínimo 2)
                    </label>
                    <button
                      type="button"
                      onClick={preencherEscalaPadrao}
                      className="inline-flex items-center space-x-1 text-[11px] font-semibold text-[#2f2c79] hover:underline cursor-pointer"
                    >
                      <Sparkles size={13} className="text-[#ff9800]" />
                      <span>Preencher com Escala Padrão</span>
                    </button>
                  </div>

                  <div className="space-y-2">
                    {alternativasForm.map((alt, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: '#2f2c79' }}
                        >
                          {index + 1}
                        </span>
                        <input
                          type="text"
                          value={alt.texto}
                          onChange={(e) => {
                            const copy = [...alternativasForm];
                            copy[index].texto = e.target.value;
                            setAlternativasForm(copy);
                          }}
                          placeholder={`Descrição da alternativa ${index + 1}...`}
                          className="flex-1 p-2 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#ff9800]"
                        />
                        {alternativasForm.length > 2 && (
                          <button
                            type="button"
                            onClick={() => {
                              const copy = alternativasForm.filter((_, i) => i !== index);
                              setAlternativasForm(copy);
                            }}
                            className="p-1.5 text-slate-400 hover:text-rose-500 cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {alternativasForm.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setAlternativasForm([
                          ...alternativasForm,
                          { idAlternativa: alternativasForm.length + 1, texto: '' },
                        ])
                      }
                      className="text-xs font-semibold text-[#2f2c79] hover:text-[#171a4a] inline-flex items-center space-x-1 mt-1 cursor-pointer"
                    >
                      <Plus size={14} />
                      <span>Adicionar Mais uma Alternativa</span>
                    </button>
                  )}
                </div>
              )}

              {/* Botões do Modal */}
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
                  {salvando ? 'Salvando...' : editandoId ? 'Atualizar Questão' : 'Cadastrar Questão'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
