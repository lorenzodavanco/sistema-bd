import React, { useEffect, useState } from 'react';
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  User,
  ArrowRight,
  Sparkles,
  AlertCircle,
  X,
  FileCheck,
  Send,
  Eye,
} from 'lucide-react';
import type { Usuario, Avaliacao, Questao, Alternativa, Designacao, Resposta } from '../types';
import { api } from '../services/api';

interface ResponderAvaliacaoProps {
  currentUser: Usuario | null;
  onOpenSelector?: () => void;
}

interface QuestaoComDetalhes extends Questao {
  alternativas: Alternativa[];
  peso?: number;
}

export const ResponderAvaliacao: React.FC<ResponderAvaliacaoProps> = ({ currentUser }) => {
  const [designacoes, setDesignacoes] = useState<Designacao[]>([]);
  const [avaliacoesMap, setAvaliacoesMap] = useState<Map<number, Avaliacao>>(new Map());
  const [usuariosMap, setUsuariosMap] = useState<Map<number, Usuario>>(new Map());
  const [statusRespostas, setStatusRespostas] = useState<{ [id: number]: boolean }>({});
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Modal de Preenchimento / Visualização
  const [modalAberto, setModalAberto] = useState(false);
  const [designacaoAtiva, setDesignacaoAtiva] = useState<Designacao | null>(null);
  const [questoesQuestionario, setQuestoesQuestionario] = useState<QuestaoComDetalhes[]>([]);
  const [respostasForm, setRespostasForm] = useState<{ [idQuestao: number]: string }>({});
  const [modoVisualizacao, setModoVisualizacao] = useState(false);
  const [carregandoQuestionario, setCarregandoQuestionario] = useState(false);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (currentUser) {
      carregarMinhasDesignacoes();
    } else {
      setLoading(false);
    }
  }, [currentUser]);

  const carregarMinhasDesignacoes = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [minhasDesigs, todasAvs, todosUsrs] = await Promise.all([
        api.designacoes.listar({ idAvaliador: currentUser.idUsuario }),
        api.avaliacoes.listar(),
        api.usuarios.listar(),
      ]);

      const avMap = new Map<number, Avaliacao>();
      todasAvs.forEach((a) => avMap.set(a.idAvaliacao, a));
      setAvaliacoesMap(avMap);

      const usrMap = new Map<number, Usuario>();
      todosUsrs.forEach((u) => usrMap.set(u.idUsuario, u));
      setUsuariosMap(usrMap);

      setDesignacoes(minhasDesigs);

      // Checa quais já foram respondidas
      const statusMap: { [id: number]: boolean } = {};
      await Promise.all(
        minhasDesigs.map(async (d) => {
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
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar questionários atribuídos' });
    } finally {
      setLoading(false);
    }
  };

  const abrirQuestionario = async (d: Designacao, somenteLeitura = false) => {
    setDesignacaoAtiva(d);
    setModoVisualizacao(somenteLeitura);
    setCarregandoQuestionario(true);
    setModalAberto(true);

    try {
      // 1. Busca composição do ciclo
      const composicao = await api.avaliacoes.listarQuestoes(d.idAvaliacao);

      // 2. Para cada questão da composição, busca enunciado, tipo e alternativas
      const detalhes: QuestaoComDetalhes[] = await Promise.all(
        composicao.map(async (c: any) => {
          const q = await api.questoes.buscarPorId(c.idQuestao);
          let alts: Alternativa[] = [];
          if (q.tipoQuestao === 'MULTIPLA_ESCOLHA') {
            alts = await api.questoes.listarAlternativas(q.idQuestao);
          }
          return {
            ...q,
            peso: Number(c.peso) || 1.0,
            alternativas: alts,
          };
        })
      );

      setQuestoesQuestionario(detalhes);

      // 3. Se for somente leitura ou já tiver respostas, carrega as respostas existentes
      if (somenteLeitura || statusRespostas[d.idDesignacao]) {
        const respostasExistentes = await api.designacoes.listarRespostas(d.idDesignacao);
        const mapResp: { [idQuestao: number]: string } = {};
        respostasExistentes.forEach((r: Resposta) => {
          mapResp[r.idQuestao] = r.valorResposta;
        });
        setRespostasForm(mapResp);
      } else {
        setRespostasForm({});
      }
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao carregar perguntas do questionário' });
    } finally {
      setCarregandoQuestionario(false);
    }
  };

  // Preenchimento rápido para o Pitch de 5 minutos
  const preencherAutomaticamenteDemo = () => {
    const respostasDemo: { [idQuestao: number]: string } = {};
    questoesQuestionario.forEach((q) => {
      if (q.tipoQuestao === 'MULTIPLA_ESCOLHA') {
        // Seleciona 3 (Bom) ou 4 (Excelente) para um bom resultado de teste
        const nota = Math.random() > 0.4 ? '4' : '3';
        respostasDemo[q.idQuestao] = nota;
      } else {
        respostasDemo[q.idQuestao] =
          'Profissional muito dedicado, com excelente capacidade de resolução técnica e colaboração com o time.';
      }
    });
    setRespostasForm(respostasDemo);
  };

  const handleSubmeterRespostas = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!designacaoAtiva) return;

    // Validação se todas foram respondidas
    const faltando = questoesQuestionario.find(
      (q) => !respostasForm[q.idQuestao] || respostasForm[q.idQuestao].trim() === ''
    );

    if (faltando) {
      setFeedback({
        tipo: 'erro',
        texto: `Por favor, responda a questão: "${faltando.enunciado.substring(0, 45)}..." antes de enviar.`,
      });
      return;
    }

    setEnviando(true);
    try {
      const payload = Object.entries(respostasForm).map(([idQuestao, valorResposta]) => ({
        idQuestao: Number(idQuestao),
        valorResposta: valorResposta.trim(),
      }));

      await api.designacoes.submeterRespostas(designacaoAtiva.idDesignacao, payload);

      setFeedback({
        tipo: 'sucesso',
        texto: 'Avaliação 360° enviada com sucesso! Respostas gravadas atomicamente no banco.',
      });

      setModalAberto(false);
      await carregarMinhasDesignacoes();
    } catch (err: any) {
      setFeedback({ tipo: 'erro', texto: err.message || 'Erro ao registrar respostas da avaliação' });
    } finally {
      setEnviando(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
        <div
          className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-[#000020] mb-4 shadow"
          style={{ backgroundColor: '#ffcc50' }}
        >
          <User size={32} />
        </div>
        <h3 className="text-xl font-bold text-[#171a4a] mb-2">Nenhum Usuário Selecionado</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-4">
          Para responder a uma avaliação 360°, selecione qual colaborador você deseja simular no seletor rápido no topo da página.
        </p>
      </div>
    );
  }

  const pendentes = designacoes.filter((d) => !statusRespostas[d.idDesignacao]);
  const concluidas = designacoes.filter((d) => !!statusRespostas[d.idDesignacao]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-xs font-bold text-[#000020]"
              style={{ backgroundColor: '#ffcc50' }}
            >
              RF5 • Realização da Avaliação
            </span>
            <span className="text-xs text-slate-500 font-semibold">
              Logado como: <strong className="text-[#171a4a]">{currentUser.nome}</strong>
            </span>
          </div>
          <h2 className="text-xl font-extrabold text-[#171a4a] mt-1">
            Minhas Avaliações Atribuídas
          </h2>
          <p className="text-xs text-slate-500">
            Responda aos questionários 360° para os colegas de equipe para os quais você foi designado neste ciclo.
          </p>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-semibold">
            <Clock size={14} className="text-[#ff9800]" />
            <span>{pendentes.length} Pendentes</span>
          </div>
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{concluidas.length} Concluídas</span>
          </div>
        </div>
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
            {feedback.tipo === 'sucesso' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{feedback.texto}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Seção 1: Avaliações Pendentes */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#171a4a] flex items-center space-x-2">
          <Clock size={16} className="text-[#ff9800]" />
          <span>Avaliações Aguardando Sua Resposta ({pendentes.length})</span>
        </h3>

        {loading ? (
          <div className="text-center py-8 text-sm text-slate-500">Carregando questionários...</div>
        ) : pendentes.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-500">
            Você não possui avaliações pendentes no momento! Todas as suas atribuições foram preenchidas.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendentes.map((d) => {
              const avaliado = usuariosMap.get(d.idAvaliado);
              const av = avaliacoesMap.get(d.idAvaliacao);

              return (
                <div
                  key={d.idDesignacao}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#ffcc50', color: '#000020' }}
                      >
                        {av ? av.titulo : `Avaliação #${d.idAvaliacao}`}
                      </span>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        Pendente
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 mb-4">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center font-extrabold text-white text-base shadow"
                        style={{ backgroundColor: '#2f2c79' }}
                      >
                        {avaliado ? avaliado.nome.substring(0, 2).toUpperCase() : 'AD'}
                      </div>
                      <div>
                        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                          Você está avaliando:
                        </span>
                        <h4 className="text-base font-extrabold text-[#171a4a]">
                          {avaliado ? avaliado.nome : `Colaborador #${d.idAvaliado}`}
                        </h4>
                        <p className="text-xs text-slate-500">
                          {avaliado?.cargo} •{' '}
                          <span className="font-semibold text-[#2f2c79]">{avaliado?.departamento}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-mono">
                      Designação #{d.idDesignacao}
                    </span>

                    <button
                      onClick={() => abrirQuestionario(d, false)}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 cursor-pointer"
                      style={{ backgroundColor: '#ff9800' }}
                    >
                      <span>Responder Avaliação</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Seção 2: Avaliações Concluídas */}
      {concluidas.length > 0 && (
        <div className="space-y-3 pt-4">
          <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#171a4a] flex items-center space-x-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Avaliações Já Preenchidas ({concluidas.length})</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {concluidas.map((d) => {
              const avaliado = usuariosMap.get(d.idAvaliado);
              const av = avaliacoesMap.get(d.idAvaliacao);

              return (
                <div
                  key={d.idDesignacao}
                  className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <FileCheck size={18} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#171a4a]">
                        {avaliado ? avaliado.nome : `Avaliado #${d.idAvaliado}`}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                        {av?.titulo}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => abrirQuestionario(d, true)}
                    className="p-1.5 text-slate-400 hover:text-[#2f2c79] transition cursor-pointer"
                    title="Visualizar Respostas Enviadas"
                  >
                    <Eye size={16} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Preenchimento / Visualização (RF5) */}
      {modalAberto && designacaoAtiva && (
        <div className="fixed inset-0 z-50 bg-[#000020]/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col border border-slate-200">
            {/* Topo do Questionário */}
            <div
              className="px-6 py-4 flex items-center justify-between text-white rounded-t-2xl shrink-0"
              style={{ backgroundColor: '#171a4a' }}
            >
              <div>
                <div className="flex items-center space-x-2">
                  <ClipboardCheck size={20} style={{ color: '#ffcc50' }} />
                  <h3 className="font-bold text-base">
                    {modoVisualizacao ? 'Respostas da Avaliação 360°' : 'Questionário de Avaliação 360°'}
                  </h3>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Avaliando:{' '}
                  <strong className="text-[#ffcc50]">
                    {usuariosMap.get(designacaoAtiva.idAvaliado)?.nome}
                  </strong>{' '}
                  ({usuariosMap.get(designacaoAtiva.idAvaliado)?.cargo})
                </p>
              </div>

              <button
                onClick={() => setModalAberto(false)}
                className="text-slate-300 hover:text-white cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Barra de Ações Rápidas do Pitch (Preenchimento Automático) */}
            {!modoVisualizacao && (
              <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between shrink-0">
                <span className="text-xs text-slate-500 font-medium">
                  {Object.keys(respostasForm).length} de {questoesQuestionario.length} respondidas
                </span>

                <button
                  type="button"
                  onClick={preencherAutomaticamenteDemo}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-lg transition border border-[#ff9800]/40 text-[#171a4a] hover:bg-[#ff9800]/10 cursor-pointer"
                >
                  <Sparkles size={13} className="text-[#ff9800]" />
                  <span>Preencher Automaticamente (Demo / Pitch)</span>
                </button>
              </div>
            )}

            {/* Perguntas com Scroll */}
            <form onSubmit={handleSubmeterRespostas} className="flex-1 flex flex-col overflow-hidden">
              <div className="p-6 overflow-y-auto space-y-6 flex-1">
                {carregandoQuestionario ? (
                  <div className="text-center py-12 text-sm text-slate-500">
                    Carregando critérios e alternativas do questionário...
                  </div>
                ) : questoesQuestionario.length === 0 ? (
                  <div className="text-center py-8 text-sm text-slate-500">
                    Nenhuma questão configurada na composição deste ciclo.
                  </div>
                ) : (
                  questoesQuestionario.map((q, idx) => {
                    const respostaEscolhida = respostasForm[q.idQuestao] || '';

                    return (
                      <div
                        key={q.idQuestao}
                        className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start space-x-3">
                            <span
                              className="w-7 h-7 rounded-xl flex items-center justify-center text-xs font-black text-white shrink-0 mt-0.5"
                              style={{ backgroundColor: '#2f2c79' }}
                            >
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-bold text-[#171a4a] leading-snug">
                                {q.enunciado}
                              </p>
                              <span className="text-[10px] text-slate-400 font-mono">
                                Peso: {q.peso} •{' '}
                                {q.tipoQuestao === 'MULTIPLA_ESCOLHA'
                                  ? 'Escala Ponderada'
                                  : 'Feedback Dissertativo'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Múltipla Escolha: Botões de Alternativas */}
                        {q.tipoQuestao === 'MULTIPLA_ESCOLHA' ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                            {q.alternativas.map((alt) => {
                              const isSelected = respostaEscolhida === alt.idAlternativa.toString();

                              return (
                                <button
                                  type="button"
                                  key={alt.idAlternativa}
                                  disabled={modoVisualizacao}
                                  onClick={() =>
                                    setRespostasForm((prev) => ({
                                      ...prev,
                                      [q.idQuestao]: alt.idAlternativa.toString(),
                                    }))
                                  }
                                  className={`p-3 rounded-xl text-left border text-xs transition cursor-pointer flex items-start space-x-2.5 ${
                                    isSelected
                                      ? 'border-[#ff9800] bg-amber-50/50 text-[#000020] font-bold shadow-xs'
                                      : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                                  }`}
                                >
                                  <span
                                    className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                      isSelected
                                        ? 'bg-[#ff9800] text-[#000020]'
                                        : 'bg-slate-100 text-slate-600'
                                    }`}
                                  >
                                    {alt.idAlternativa}
                                  </span>
                                  <span className="leading-snug">{alt.texto}</span>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          /* Texto Livre: Textarea */
                          <div className="pt-2">
                            <textarea
                              rows={3}
                              disabled={modoVisualizacao}
                              value={respostaEscolhida}
                              onChange={(e) =>
                                setRespostasForm((prev) => ({
                                  ...prev,
                                  [q.idQuestao]: e.target.value,
                                }))
                              }
                              placeholder="Digite suas observações, pontos fortes ou sugestões de desenvolvimento..."
                              className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-[#ff9800]"
                            />
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Rodapé do Modal */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between rounded-b-2xl shrink-0">
                <span className="text-xs text-slate-500">
                  {modoVisualizacao
                    ? 'Questionário em modo de visualização.'
                    : 'Transação atômica gerenciada pelo PostgreSQL (@Transactional).'}
                </span>

                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setModalAberto(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer"
                  >
                    Fechar
                  </button>

                  {!modoVisualizacao && (
                    <button
                      type="submit"
                      disabled={enviando || questoesQuestionario.length === 0}
                      className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-[#000020] shadow transition hover:opacity-95 disabled:opacity-50 cursor-pointer"
                      style={{ backgroundColor: '#ff9800' }}
                    >
                      <Send size={14} />
                      <span>{enviando ? 'Enviando...' : 'Submeter Avaliação 360°'}</span>
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
